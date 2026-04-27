#!/usr/bin/env node
// CLI helper for inspecting and validating custom screenshot headers

const { parseHeaders, buildHeadersMap, describeHeaders, redactSensitiveHeaders } = require('./screenshot-headers');

function printUsage() {
  console.log(`
Usage: pagesnap headers <command> [options]

Commands:
  validate <header...>   Validate header strings
  describe <header...>   Describe headers (sensitive values redacted)
  map <header...>        Output headers as JSON map

Examples:
  pagesnap headers validate "X-Custom: value" "Authorization: Bearer tok"
  pagesnap headers describe "Authorization: secret" "X-Trace: abc"
  pagesnap headers map "Accept: application/json"
`.trim());
}

function cmdValidate(args) {
  if (!args.length) { console.error('No headers provided'); process.exit(1); }
  let ok = true;
  for (const raw of args) {
    try {
      const { name, value } = require('./screenshot-headers').parseHeader(raw);
      console.log(`  ✔  "${name}" = "${value}"`);
    } catch (e) {
      console.error(`  ✘  ${e.message}`);
      ok = false;
    }
  }
  if (!ok) process.exit(1);
}

function cmdDescribe(args) {
  if (!args.length) { console.error('No headers provided'); process.exit(1); }
  try {
    const parsed = parseHeaders(args);
    const map = buildHeadersMap(parsed);
    console.log(describeHeaders(redactSensitiveHeaders(map)));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

function cmdMap(args) {
  if (!args.length) { console.error('No headers provided'); process.exit(1); }
  try {
    const parsed = parseHeaders(args);
    const map = buildHeadersMap(parsed);
    console.log(JSON.stringify(map, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

function runHeadersCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') { printUsage(); return; }
  if (cmd === 'validate') return cmdValidate(rest);
  if (cmd === 'describe') return cmdDescribe(rest);
  if (cmd === 'map') return cmdMap(rest);
  console.error(`Unknown command: ${cmd}`);
  printUsage();
  process.exit(1);
}

if (require.main === module) runHeadersCli();
module.exports = { runHeadersCli, cmdValidate, cmdDescribe, cmdMap };
