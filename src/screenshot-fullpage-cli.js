#!/usr/bin/env node
// CLI helper for full-page screenshot options

const { parseFullPageOptions, buildFullPageScript, describeFullPage, listModes } = require('./screenshot-fullpage');

function printUsage() {
  console.log('Usage: pagesnap fullpage <cmd> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list                     List available full-page modes');
  console.log('  describe --mode <m> ...  Describe parsed options');
  console.log('  script   --mode <m> ...  Print browser script for given mode');
  console.log('  validate --mode <m> ...  Validate options and exit');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--mode') args.mode = argv[++i];
    else if (argv[i] === '--scroll-pause') args.scrollPause = Number(argv[++i]);
    else if (argv[i] === '--max-height') args.maxHeight = Number(argv[++i]);
    else if (argv[i] === '--lazy-selector') args.lazySelector = argv[++i];
  }
  return args;
}

function cmdList() {
  const modes = listModes();
  modes.forEach(m => console.log(`  ${m.name.padEnd(10)} ${m.description}`));
}

function cmdDescribe(argv) {
  const raw = parseArgs(argv);
  const opts = parseFullPageOptions(raw);
  console.log(describeFullPage(opts));
}

function cmdScript(argv) {
  const raw = parseArgs(argv);
  const opts = parseFullPageOptions(raw);
  const script = buildFullPageScript(opts);
  if (!script) {
    console.log('(no script needed for native mode)');
  } else {
    console.log(script);
  }
}

function cmdValidate(argv) {
  const raw = parseArgs(argv);
  try {
    const opts = parseFullPageOptions(raw);
    console.log(`valid: ${describeFullPage(opts)}`);
    process.exit(0);
  } catch (err) {
    console.error(`invalid: ${err.message}`);
    process.exit(1);
  }
}

function runFullPageCli(argv) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') { printUsage(); return; }
  if (cmd === 'list') { cmdList(); return; }
  if (cmd === 'describe') { cmdDescribe(rest); return; }
  if (cmd === 'script') { cmdScript(rest); return; }
  if (cmd === 'validate') { cmdValidate(rest); return; }
  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

if (require.main === module) {
  runFullPageCli(process.argv.slice(2));
}

module.exports = { runFullPageCli, parseArgs, cmdList, cmdDescribe, cmdScript, cmdValidate };
