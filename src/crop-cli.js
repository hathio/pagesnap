#!/usr/bin/env node
// crop-cli.js — validate and describe crop region config from the command line

const { parseCrops, describeCrop } = require('./crop');

function printUsage() {
  console.log('Usage: pagesnap crop <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  validate  <json>   Parse and validate a crop region JSON string');
  console.log('  describe  <json>   Print human-readable description of crop region(s)');
  console.log('');
  console.log('Examples:');
  console.log('  pagesnap crop validate \'{"width":200,"height":100}\'');
  console.log('  pagesnap crop describe \'{"x":10,"y":20,"width":200,"height":100,"origin":"top-left"}\'');
}

function cmdValidate(jsonStr) {
  let raw;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    console.error('Error: invalid JSON input');
    process.exit(1);
  }
  try {
    const crops = parseCrops(raw);
    console.log(`✓ Valid — ${crops.length} crop region(s) parsed`);
  } catch (err) {
    console.error(`✗ Invalid crop: ${err.message}`);
    process.exit(1);
  }
}

function cmdDescribe(jsonStr) {
  let raw;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    console.error('Error: invalid JSON input');
    process.exit(1);
  }
  try {
    const crops = parseCrops(raw);
    crops.forEach((c, i) => console.log(`[${i}] ${describeCrop(c)}`));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function runCropCli(argv = process.argv.slice(2)) {
  const [cmd, arg] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') return printUsage();
  if (cmd === 'validate') return cmdValidate(arg || '{}');
  if (cmd === 'describe') return cmdDescribe(arg || '{}');
  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

if (require.main === module) runCropCli();
module.exports = { runCropCli, cmdValidate, cmdDescribe };
