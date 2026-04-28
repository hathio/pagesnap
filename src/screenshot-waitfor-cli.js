#!/usr/bin/env node
// CLI for screenshot wait-for conditions

const { parseWaitCondition, buildWaitScript, describeWait, listWaitTypes } = require('./screenshot-waitfor');

function printUsage() {
  console.log(`Usage: pagesnap waitfor <command> [options]

Commands:
  list                     List available wait types
  describe <type>          Describe a wait type
  validate <json>          Validate a wait condition JSON
  script <json>            Output the Puppeteer script for a condition

Examples:
  pagesnap waitfor list
  pagesnap waitfor describe selector
  pagesnap waitfor validate '{"type":"selector","selector":"#app"}'
  pagesnap waitfor script '{"type":"timeout","timeout":2000}'
`);
}

function cmdList() {
  const types = listWaitTypes();
  console.log('Available wait types:');
  types.forEach(t => console.log(`  ${t.type.padEnd(12)} ${t.description}`));
}

function cmdDescribe(type) {
  const types = listWaitTypes();
  const found = types.find(t => t.type === type);
  if (!found) {
    console.error(`Unknown wait type: ${type}`);
    process.exit(1);
  }
  console.log(`Type:        ${found.type}`);
  console.log(`Description: ${found.description}`);
}

function cmdValidate(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('Invalid JSON input');
    process.exit(1);
  }
  try {
    const condition = parseWaitCondition(parsed);
    console.log('Valid:', describeWait(condition));
  } catch (err) {
    console.error('Invalid:', err.message);
    process.exit(1);
  }
}

function cmdScript(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('Invalid JSON input');
    process.exit(1);
  }
  try {
    const condition = parseWaitCondition(parsed);
    const script = buildWaitScript([condition]);
    console.log(script);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

function runWaitForCli(argv = process.argv.slice(2)) {
  const [cmd, arg] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') return printUsage();
  if (cmd === 'list') return cmdList();
  if (cmd === 'describe') return cmdDescribe(arg);
  if (cmd === 'validate') return cmdValidate(arg);
  if (cmd === 'script') return cmdScript(arg);
  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

module.exports = { printUsage, cmdList, cmdDescribe, cmdValidate, cmdScript, runWaitForCli };

if (require.main === module) runWaitForCli();
