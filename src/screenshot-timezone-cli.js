#!/usr/bin/env node
// screenshot-timezone-cli.js — CLI for timezone emulation options

const { parseTimezone, describeTimezone, listPresets, buildTimezoneContext } = require('./screenshot-timezone');

function printUsage() {
  console.log(`
Usage: pagesnap timezone <command> [args]

Commands:
  list                  List all built-in timezone presets
  describe <tz>         Describe a timezone preset or IANA string
  validate <tz>         Validate a timezone value
  context <tz>          Show browser context config for a timezone

Examples:
  pagesnap timezone list
  pagesnap timezone describe tokyo
  pagesnap timezone validate America/Chicago
  pagesnap timezone context us-east
`.trim());
}

function cmdList() {
  const presets = listPresets();
  console.log('Available timezone presets:\n');
  presets.forEach(p => {
    const offset = p.offset >= 0 ? `+${p.offset / 60}` : `${p.offset / 60}`;
    console.log(`  ${p.key.padEnd(14)} ${p.id.padEnd(28)} UTC${offset}  — ${p.label}`);
  });
}

function cmdDescribe(input) {
  if (!input) { console.error('Error: timezone argument required'); process.exit(1); }
  try {
    const tz = parseTimezone(input);
    console.log(`Timezone : ${tz.id}`);
    console.log(`Label    : ${tz.label || '(custom)'}`);
    console.log(`Preset   : ${tz.preset || 'none'}`);
    console.log(`Offset   : ${tz.offset !== null ? `UTC${tz.offset >= 0 ? '+' : ''}${tz.offset / 60}` : '(runtime)'}`);
    console.log(`Summary  : ${describeTimezone(tz)}`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

function cmdValidate(input) {
  if (!input) { console.error('Error: timezone argument required'); process.exit(1); }
  try {
    const tz = parseTimezone(input);
    console.log(`✓ Valid timezone: ${tz.id}`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}

function cmdContext(input) {
  if (!input) { console.error('Error: timezone argument required'); process.exit(1); }
  try {
    const tz = parseTimezone(input);
    const ctx = buildTimezoneContext(tz);
    console.log(JSON.stringify(ctx, null, 2));
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

function runTimezoneCli(argv = process.argv.slice(2)) {
  const [cmd, arg] = argv;
  switch (cmd) {
    case 'list': return cmdList();
    case 'describe': return cmdDescribe(arg);
    case 'validate': return cmdValidate(arg);
    case 'context': return cmdContext(arg);
    default: printUsage();
  }
}

if (require.main === module) runTimezoneCli();
module.exports = { runTimezoneCli, cmdList, cmdDescribe, cmdValidate, cmdContext };
