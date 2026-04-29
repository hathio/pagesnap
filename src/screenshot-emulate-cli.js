#!/usr/bin/env node
// CLI for device emulation options

const { parseEmulateOptions, buildEmulateScript, describeEmulate, listPresets, DEVICE_PRESETS } = require('./screenshot-emulate');

function printUsage() {
  console.log(`Usage: pagesnap emulate <command> [options]

Commands:
  list                  List available device presets
  describe <preset>     Describe a device preset
  validate <json>       Validate emulation options JSON
  script <json>         Output Puppeteer script for emulation options

Examples:
  pagesnap emulate list
  pagesnap emulate describe iphone-14
  pagesnap emulate validate '{"preset":"pixel-7"}'
  pagesnap emulate script '{"width":1280,"height":800}'`);
}

function cmdList() {
  const presets = listPresets();
  console.log('Available device presets:\n');
  for (const name of presets) {
    const p = DEVICE_PRESETS[name];
    const type = p.isMobile ? 'mobile' : 'desktop';
    console.log(`  ${name.padEnd(16)} ${p.width}x${p.height}  dpr=${p.deviceScaleFactor}  ${type}`);
  }
}

function cmdDescribe(name) {
  if (!name) {
    console.error('Error: preset name required');
    process.exit(1);
  }
  let opts;
  try {
    opts = parseEmulateOptions({ preset: name });
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
  console.log(describeEmulate(opts));
  console.log(JSON.stringify(opts, null, 2));
}

function cmdValidate(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('Error: invalid JSON input');
    process.exit(1);
  }
  try {
    const opts = parseEmulateOptions(parsed);
    console.log('Valid:', describeEmulate(opts));
  } catch (e) {
    console.error(`Invalid: ${e.message}`);
    process.exit(1);
  }
}

function cmdScript(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('Error: invalid JSON input');
    process.exit(1);
  }
  const opts = parseEmulateOptions(parsed);
  const script = buildEmulateScript(opts);
  console.log(script || '// no emulation script');
}

function runEmulateCli(argv = process.argv.slice(2)) {
  const [cmd, arg] = argv;
  switch (cmd) {
    case 'list': return cmdList();
    case 'describe': return cmdDescribe(arg);
    case 'validate': return cmdValidate(arg);
    case 'script': return cmdScript(arg);
    default:
      printUsage();
      if (cmd) process.exit(1);
  }
}

module.exports = { printUsage, cmdList, cmdDescribe, cmdValidate, cmdScript, runEmulateCli };

if (require.main === module) runEmulateCli();
