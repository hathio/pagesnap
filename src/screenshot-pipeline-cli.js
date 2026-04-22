#!/usr/bin/env node
import { buildPipelineConfig, runPipeline, describePipeline } from './screenshot-pipeline.js';
import { loadConfig } from './config.js';

function printUsage() {
  console.log(`
pagesnap pipeline - run the full screenshot pipeline for one or more URLs

Usage:
  pagesnap pipeline <url> [options]

Options:
  --viewport <WxH>       Viewport size or preset (default: desktop)
  --format <fmt>         Screenshot format: png, jpeg, webp (default: png)
  --throttle <ms>        Delay between captures in ms (default: 0)
  --dry-run              Print pipeline config without capturing
  --help                 Show this help
`.trim());
}

function parseArgs(argv) {
  const args = { urls: [], viewport: null, format: 'png', throttle: {}, dryRun: false };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help') { printUsage(); process.exit(0); }
    else if (arg === '--viewport') { args.viewport = argv[++i]; }
    else if (arg === '--format') { args.format = argv[++i]; }
    else if (arg === '--throttle') { args.throttle = { delayMs: Number(argv[++i]) }; }
    else if (arg === '--dry-run') { args.dryRun = true; }
    else if (!arg.startsWith('--')) { args.urls.push(arg); }
    i++;
  }
  return args;
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (args.urls.length === 0) {
    console.error('Error: at least one URL is required.');
    printUsage();
    process.exit(1);
  }

  const config = await loadConfig();
  const pipelineConfig = buildPipelineConfig({
    viewport: args.viewport || config.viewport,
    format: args.format || config.format,
    throttle: args.throttle,
    timeouts: config.timeouts || {},
    masks: config.masks || [],
  });

  console.log('Pipeline:', describePipeline(pipelineConfig));

  if (args.dryRun) {
    console.log('Dry run — no screenshots taken.');
    return;
  }

  const { capture } = await import('./capture.js');

  for (const url of args.urls) {
    console.log(`Capturing: ${url}`);
    const results = await runPipeline(url, pipelineConfig, capture);
    for (const r of results) {
      console.log(`  [${r.viewport.width}x${r.viewport.height}] => ${r.screenshotPath}`);
    }
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
