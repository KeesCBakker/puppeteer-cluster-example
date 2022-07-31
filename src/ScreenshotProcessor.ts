import { Cluster } from "puppeteer-cluster"
import sanitize from "sanitize-filename"
import tmp from "tmp"
import fs from "node:fs/promises"
import path from "node:path"
import { ScreenshotOptions } from "puppeteer"

export type ScreenshotTask = {
  name?: string
  url: string
  width?: number
  height?: number
  screenshotOptions: ScreenshotOptions
  onProcessed?: (settings: ScreenshotTask) => Promise<void>
}

export type ProcessorOptions = {
  onProcessedItem?: (task: ProcessedScreenshot) => Promise<void>
  screenshotOptions?: ScreenshotOptions
  maxConcurrency?: number
  width?: number
  height?: number
  folder?: string
}

export type ProcessedScreenshot = {
  name?: string
  url: string
  path: string
}

export const FullPagePngScreenshots = Object.freeze(<ScreenshotOptions>{
  fullPage: true,
  type: "png",
})

export const FullPageJpgScreenshots = Object.freeze(<ScreenshotOptions>{
  fullPage: true,
  type: "jpeg",
  quality: 80,
})

export class ScreenshotProcessor {
  private cluster: Cluster<ScreenshotTask, void>

  constructor(private maxConcurrency: number) {}

  public async start() {
    if (!this.cluster) {
      this.cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: this.maxConcurrency,
      })
    }
  }

  public async stop() {
    if (this.cluster) {
      await this.cluster.idle()
      await this.cluster.close()
      this.cluster = null
    }
  }

  public async queue(task: ScreenshotTask) {
    await this.start()
    await this.cluster.queue(task, async task => {
      if (task.data.height || task.data.width) {
        await task.page.setViewport({
          width: task.data.width || 800,
          height: task.data.height || 600,
        })
      }

      // slow -- but has the latest
      await task.page.goto(task.data.url)
      try {
        await task.page.screenshot(task.data.screenshotOptions)
      } catch (ex) {
        console.error(
          `Error while taking screenshot\nData: ${JSON.stringify(
            task.data
          )}\n${ex}`
        )
        throw ex
      }

      if (task.data.onProcessed) {
        await task.data.onProcessed(task.data)
      }
    })
  }

  public static async run(
    urls: Record<string, string>,
    options: ProcessorOptions
  ) {
    // start the processor
    let processor = new ScreenshotProcessor(options.maxConcurrency || 8)
    await processor.start()

    // ensure folder path
    let tmpFolder =
      options.folder || tmp.dirSync({ postfix: "screenshots" }).name
    tmpFolder = path.resolve(tmpFolder)
    await fs.mkdir(tmpFolder, { recursive: true })

    Object.entries(urls).forEach(([name, url]) => {
      let screenshotOptions = Object.assign(
        {},
        options.screenshotOptions || FullPageJpgScreenshots
      ) as ScreenshotOptions

      let tempFilePath = path.join(
        tmpFolder,
        `${sanitize(name)}.${screenshotOptions.type}`
      )
      screenshotOptions.path = tempFilePath

      let task: ScreenshotTask = {
        name,
        url: url,
        width: options.width,
        height: options.height,
        screenshotOptions: screenshotOptions,
        onProcessed: async () => {
          if (options.onProcessedItem) {
            await options.onProcessedItem({
              name: name,
              url: url,
              path: tempFilePath,
            })
          }
        },
      }
      processor.queue(task)
    })

    await processor.stop()
  }
}
