#!/usr/bin/env node
// screenshot-geolocation-cli.js — CLI for geolocation options

const { parseGeolocation, buildGeolocationContext, describeGeolocation, listPresets } = require('./screenshot-geolocation');

function printUsage() {
  console.log(`
pagesnap geolocation <command> [options]

Commands:
  list                     List available preset locations
  describe <value>         Describe a geolocation value
  validate <value>         Validate a geolocation value

Examples:
  pagesnap geolocation list
  pagesnap geolocation describe london
  pagesnap geolocation describe "48.8566,2.3522,50"
  pagesnap geolocation validate "91,0"
`.trim());
}

function cmdList() {
  const presets = listPresets();
  console.log('Built-in geolocation presets:\n');
  for (const p of presets) {
    console.log(`  ${p.name.padEnd(12)} lat=${p.latitude}, lng=${p.longitude}, accuracy=${p.accuracy}m`);
  }
}

function cmdDescribe(value) {
  if (!value) { console.error('Error: value required'); process.exit(1); }
  try {
    const geo = parseGeolocation(value);
    const ctx = buildGeolocationContext(geo);
    console.log(describeGeolocation(ctx));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function cmdValidate(value) {
  if (!value) { console.error('Error: value required'); process.exit(1); }
  try {
    const geo = parseGeolocation(value);
    buildGeolocationContext(geo);
    console.log('Valid geolocation.');
  } catch (err) {
    console.error(`Invalid: ${err.message}`);
    process.exit(1);
  }
}

function runGeolocationCli(argv = process.argv.slice(2)) {
  const [cmd, value] = argv;
  switch (cmd) {
    case 'list': return cmdList();
    case 'describe': return cmdDescribe(value);
    case 'validate': return cmdValidate(value);
    default:
      printUsage();
      if (cmd) process.exit(1);
  }
}

if (require.main === module) runGeolocationCli();

module.exports = { printUsage, cmdList, cmdDescribe, cmdValidate, runGeolocationCli };
