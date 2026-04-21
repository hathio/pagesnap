#!/usr/bin/env node
// CLI helper: pagesnap format --list | --describe <fmt> | --validate <fmt>

const {
  SUPPORTED_FORMATS,
  parseFormat,
  buildScreenshotOptions,
  describeFormat,
} = require('./screenshot-format');

function printUsage() {
  console.log('Usage: pagesnap format <command>');
  console.log('');
  console.log('Commands:');
  console.log('  list                  List all supported screenshot formats');
  console.log('  describe <format>     Show details for a specific format');
  console.log('  validate <format>     Exit 0 if format is valid, 1 otherwise');
  console.log('  options <format>      Print puppeteer screenshot options as JSON');
}

function cmdList() {
  console.log('Supported formats:');
  for (const fmt of SUPPORTED_FORMATS) {
    console.log(`  ${fmt.padEnd(8)} ${describeFormat(fmt)}`);
  }
}

function cmdDescribe(fmt) {
  try {
    const resolved = parseFormat(fmt);
    console.log(describeFormat(resolved));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function cmdValidate(fmt) {
  try {
    parseFormat(fmt);
    console.log(`"${fmt}" is a valid format.`);
    process.exit(0);
  } catch {
    console.error(`"${fmt}" is not a supported format.`);
    process.exit(1);
  }
}

function cmdOptions(fmt) {
  try {
    const resolved = parseFormat(fmt);
    const opts = buildScreenshotOptions(resolved);
    console.log(JSON.stringify(opts, null, 2));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function run(argv = process.argv.slice(2)) {
  const [cmd, arg] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') return printUsage();
  if (cmd === 'list') return cmdList();
  if (cmd === 'describe') return cmdDescribe(arg);
  if (cmd === 'validate') return cmdValidate(arg);
  if (cmd === 'options') return cmdOptions(arg);
  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

if (require.main === module) run();
module.exports = { run, cmdList, cmdDescribe, cmdValidate, cmdOptions };
