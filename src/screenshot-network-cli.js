#!/usr/bin/env node
// CLI for inspecting and validating network throttle options

const { parseNetworkOptions, describeNetwork, buildNetworkScript, listPresets, PRESETS } = require('./screenshot-network');

function printUsage() {
  console.log(`Usage: pagesnap network <cmd> [args]

Commands:
  list                  List available network presets
  describe <preset>     Describe a preset
  validate <json>       Validate a network options JSON string
  script <preset>       Print the browser script for a preset
`);
}

function cmdList() {
  const presets = listPresets();
  console.log('Available network presets:\n');
  for (const name of presets) {
    const p = PRESETS[name];
    const offline = p.offline ? ' (offline)' : '';
    const dl = p.downloadThroughput != null ? `dl:${(p.downloadThroughput / 1000).toFixed(0)}kbps` : '';
    const lat = p.latency != null ? `latency:${p.latency}ms` : '';
    console.log(`  ${name.padEnd(12)} ${[dl, lat].filter(Boolean).join(', ')}${offline}`);
  }
}

function cmdDescribe(name) {
  if (!name) { console.error('preset name required'); process.exit(1); }
  let opts;
  try { opts = parseNetworkOptions(name); }
  catch (e) { console.error(e.message); process.exit(1); }
  console.log(`Preset: ${name}`);
  console.log(`Description: ${describeNetwork(opts)}`);
  console.log('Options:', JSON.stringify(opts, null, 2));
}

function cmdValidate(raw) {
  if (!raw) { console.error('JSON string required'); process.exit(1); }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { console.error('Invalid JSON'); process.exit(1); }
  try {
    const opts = parseNetworkOptions(parsed);
    console.log('Valid:', describeNetwork(opts));
  } catch (e) {
    console.error('Invalid:', e.message);
    process.exit(1);
  }
}

function cmdScript(name) {
  if (!name) { console.error('preset name required'); process.exit(1); }
  let opts;
  try { opts = parseNetworkOptions(name); }
  catch (e) { console.error(e.message); process.exit(1); }
  console.log(buildNetworkScript(opts));
}

function runNetworkCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === 'help' || cmd === '--help') { printUsage(); return; }
  if (cmd === 'list') { cmdList(); return; }
  if (cmd === 'describe') { cmdDescribe(rest[0]); return; }
  if (cmd === 'validate') { cmdValidate(rest[0]); return; }
  if (cmd === 'script') { cmdScript(rest[0]); return; }
  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

if (require.main === module) runNetworkCli();
module.exports = { runNetworkCli, cmdList, cmdDescribe, cmdValidate, cmdScript };
