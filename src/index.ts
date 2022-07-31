import {
  FullPageJpgScreenshots,
  FullPagePngScreenshots,
  ScreenshotProcessor,
} from "./ScreenshotProcessor"

const URLS: Record<string, string> = {
  Homepage: "https://www.wehkamp.nl/",
  Dames: "https://www.wehkamp.nl/damesmode/C21/",
  Heren: "https://www.wehkamp.nl/herenmode/C22/",
  Kinderen: "https://www.wehkamp.nl/kinderen/C23/",
  Baby: "https://www.wehkamp.nl/baby/C50/",
  Beauty: "https://www.wehkamp.nl/mooi-gezond/C29/",
  "Wonen & slapen": "https://www.wehkamp.nl/wonen-slapen/C28/",
  "Koken & tafelen": "https://www.wehkamp.nl/koken-tafelen/C51/",
  Tuin: "https://www.wehkamp.nl/tuin-klussen/C30/",
  Huishouden: "https://www.wehkamp.nl/huishouden/C27/",
  Elektronica: "https://www.wehkamp.nl/elektronica/C26/",
  Speelgoed: "https://www.wehkamp.nl/speelgoed-games/C25/",
  "Sport & vrije tijd": "https://www.wehkamp.nl/sport-vrije-tijd/C24/",
  "Boeken, films & muziek": "https://www.wehkamp.nl/boeken-films-muziek/C31/",
  Cadeaus: "https://www.wehkamp.nl/cadeaushop/C52/",
  Sale: "https://www.wehkamp.nl/sale/OPR/",
  Actie: "https://www.wehkamp.nl/actie/C92/",
  Kleding: "https://www.wehkamp.nl/kleding/C80/",
}

;(async () => {
  let method =
    process.argv[2] == "png" ? FullPagePngScreenshots : FullPageJpgScreenshots
  let c = parseInt(process.argv[3])

  let count = Object.entries(URLS).length
  let name = `Writen ${count} ${
    method == FullPageJpgScreenshots ? "JPGs" : "PNGs"
  } with ${c} instances in`
  console.time(name)
  await ScreenshotProcessor.run(URLS, {
    screenshotOptions: method,
  })
  console.timeEnd(name)
  console.log("Finished")
})()
// ;(async () => {
//   let processor = new ScreenshotProcessor(8)

//   await processor.start()

//   Object.entries(URLS).forEach(async ([name, url]) => {
//     processor.queue({
//       name,
//       url,
//       screenshotOptions: {
//         fullPage: true,
//         type: "png",
//         path: `c:\\temp\\test\\${name}.png`,
//       },
//       onProcessed: async task =>
//         console.log(
//           `${task.name} is now saved at: ${task.screenshotOptions.path}`
//         ),
//     })
//   })

//   await processor.stop()
//   console.log("Finished")
// })()
