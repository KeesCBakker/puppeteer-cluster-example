tsc
$p = "node dist/index.js"

hyperfine --warmup 2 --export-markdown benchmark-jpg.md -L max_concurrency 1,2,4,8,10,12,14,16 'node dist/index.js jpg {max_concurrency}' --show-output
hyperfine --warmup 2 --export-markdown benchmark-png.md -L max_concurrency 1,2,4,8,10,12,14,16 'node dist/index.js png {max_concurrency}' --show-output
