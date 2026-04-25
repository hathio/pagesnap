#!/usr/bin/env node
// screenshot-hover-cli.js — CLI interface for hover capture options

const { parseHoverOptions, buildHoverScript, describeHover } = require('./screenshot-hover');

function printUsage() {
  console.log(`
pagesnap hover <command> [options]

Commands:
  describe   Describe hover options from flags
  script     Print the browser script for hover
  validate   Validate hover option flags

Options:
  --selector <sel>   CSS selector to hover over
  --trigger <type>   Trigger type: css | js | none  (default: css)
  --delay <ms>       Delay after hover in ms        (default: 200)
  --no-restore       Do not restore element after capture
`.trim());
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--selector') args.selector = argv[++i];
    else if (argv[i] === '--trigger') args.trigger = argv[++i];
    else if (argv[i] === '--delay') args.delay = argv[++i];
    else if (argv[i] === '--no-restore') args.restoreAfter = false;
  }
  return args;
}

function runHoverCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === 'help' || cmd === '--help') {
    printUsage();
    return;
  }

  const rawArgs = parseArgs(rest);

  let opts;
  try {
    opts = parseHoverOptions(rawArgs);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (cmd === 'describe') {
    console.log(describeHover(opts));
    return;
  }

  if (cmd === 'script') {
    const script = buildHoverScript(opts);
    if (!script) {
      console.log('(no script — selector not set or trigger is none)');
    } else {
      console.log(script);
    }
    return;
  }

  if (cmd === 'validate') {
    console.log('OK:', describeHover(opts));
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exitCode = 1;
}

if (require.main === module) {
  runHoverCli();
}

module.exports = { runHoverCli, parseArgs };
