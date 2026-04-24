#!/usr/bin/env node
// screenshot-scroll-cli.js — CLI interface for scroll options

const { parseScrollOptions, buildScrollScript, describeScroll, listScrollModes } = require('./screenshot-scroll');

function printUsage() {
  console.log(`
Usage: pagesnap scroll <command> [options]

Commands:
  list                    List available scroll modes
  describe --mode <m>     Describe a scroll mode
  validate --mode <m>     Validate scroll options
  script --mode <m>       Print the generated scroll script

Options:
  --mode      Scroll mode: none | full | manual
  --delay     Delay between scroll steps in ms (default: 300)
  --steps     Number of scroll steps for full mode (default: 5)
  --scroll-to Pixel offset for manual mode
`.trim());
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--mode') args.mode = argv[++i];
    else if (argv[i] === '--delay') args.delay = Number(argv[++i]);
    else if (argv[i] === '--steps') args.steps = Number(argv[++i]);
    else if (argv[i] === '--scroll-to') args.scrollTo = Number(argv[++i]);
  }
  return args;
}

function runScrollCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    return;
  }

  if (cmd === 'list') {
    const modes = listScrollModes();
    modes.forEach(({ mode, description }) => {
      console.log(`  ${mode.padEnd(10)} ${description}`);
    });
    return;
  }

  const args = parseArgs(rest);

  if (cmd === 'describe') {
    if (!args.mode) { console.error('Error: --mode is required'); process.exitCode = 1; return; }
    console.log(describeScroll(args));
    return;
  }

  if (cmd === 'validate') {
    if (!args.mode) { console.error('Error: --mode is required'); process.exitCode = 1; return; }
    const opts = parseScrollOptions(args);
    console.log(JSON.stringify(opts, null, 2));
    return;
  }

  if (cmd === 'script') {
    if (!args.mode) { console.error('Error: --mode is required'); process.exitCode = 1; return; }
    const script = buildScrollScript(args);
    if (!script) { console.log('(no script generated for this configuration)'); return; }
    console.log(script);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}

if (require.main === module) runScrollCli();
module.exports = { runScrollCli, parseArgs };
