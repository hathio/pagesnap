#!/usr/bin/env node
// throttle-cli.js — expose throttle config inspection via CLI

const { parseThrottleOptions, describeThrottle } = require('./throttle');
const { loadConfig } = require('./config');

const USAGE = `
Usage: pagesnap throttle [options]

Options:
  --concurrency <n>   Max parallel captures (default: 3)
  --delay <ms>        Delay between captures in ms (default: 0)
  --show              Print resolved throttle settings and exit
  -h, --help          Show this help
`.trim();

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--concurrency' && argv[i + 1]) args.concurrency = argv[++i];
    else if (argv[i] === '--delay' && argv[i + 1]) args.delayMs = argv[++i];
    else if (argv[i] === '--show') args.show = true;
    else if (argv[i] === '-h' || argv[i] === '--help') args.help = true;
  }
  return args;
}

async function runThrottleCli(argv = process.argv.slice(2), out = console) {
  const args = parseArgs(argv);

  if (args.help) {
    out.log(USAGE);
    return;
  }

  let cfg = {};
  try {
    const loaded = await loadConfig();
    cfg = loaded.throttle ?? {};
  } catch {
    // no config file — use defaults
  }

  const merged = { ...cfg, ...args };
  const opts = parseThrottleOptions(merged);

  if (args.show || Object.keys(args).length === 0) {
    out.log('Throttle settings: ' + describeThrottle(opts));
    out.log(JSON.stringify(opts, null, 2));
    return;
  }

  out.log('Resolved: ' + describeThrottle(opts));
}

if (require.main === module) {
  runThrottleCli().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { runThrottleCli, parseArgs };
