#!/usr/bin/env node
/**
 * CLI interface for screenshot watermark options.
 * Supports listing presets, validating configs, and describing watermark output.
 */

const { parseWatermarkOptions, describeWatermark, buildWatermarkScript } = require('./screenshot-watermark');

function printUsage() {
  console.log(`
Usage: pagesnap watermark <command> [options]

Commands:
  list                     List available watermark position presets
  validate --text <t>      Validate a watermark configuration
  describe --text <t>      Describe what the watermark will look like
  script --text <t>        Print the browser script that applies the watermark

Options:
  --text <string>          Watermark text (required)
  --position <pos>         Position: top-left, top-right, bottom-left, bottom-right, center (default: bottom-right)
  --opacity <0-1>          Opacity of the watermark (default: 0.4)
  --font-size <px>         Font size in pixels (default: 14)
  --color <css>            Text color (default: rgba(0,0,0,0.4))
  --padding <px>           Padding from edge in pixels (default: 8)

Examples:
  pagesnap watermark list
  pagesnap watermark describe --text "staging" --position top-right
  pagesnap watermark validate --text "v1.2.3" --opacity 0.6
  pagesnap watermark script --text "draft" --color red
`);
}

const POSITIONS = [
  { name: 'top-left',     description: 'Top-left corner' },
  { name: 'top-right',    description: 'Top-right corner' },
  { name: 'bottom-left',  description: 'Bottom-left corner' },
  { name: 'bottom-right', description: 'Bottom-right corner (default)' },
  { name: 'center',       description: 'Centered on the page' },
];

function cmdList() {
  console.log('\nAvailable watermark positions:\n');
  for (const p of POSITIONS) {
    console.log(`  ${p.name.padEnd(16)} ${p.description}`);
  }
  console.log();
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function runWatermarkCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === 'help' || cmd === '--help') {
    printUsage();
    return;
  }

  if (cmd === 'list') {
    cmdList();
    return;
  }

  const args = parseArgs(rest);

  if (!args.text) {
    console.error('Error: --text is required');
    process.exitCode = 1;
    return;
  }

  let options;
  try {
    options = parseWatermarkOptions({
      text:     args.text,
      position: args.position,
      opacity:  args.opacity !== undefined ? parseFloat(args.opacity) : undefined,
      fontSize: args['font-size'] !== undefined ? parseInt(args['font-size'], 10) : undefined,
      color:    args.color,
      padding:  args.padding !== undefined ? parseInt(args.padding, 10) : undefined,
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (cmd === 'validate') {
    console.log('Watermark config is valid.');
    console.log(JSON.stringify(options, null, 2));
    return;
  }

  if (cmd === 'describe') {
    console.log(describeWatermark(options));
    return;
  }

  if (cmd === 'script') {
    const script = buildWatermarkScript(options);
    console.log(script);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exitCode = 1;
}

if (require.main === module) {
  runWatermarkCli();
}

module.exports = { runWatermarkCli, parseArgs };
