#!/usr/bin/env node
// screenshot-cookie-cli.js — CLI helpers for cookie config

const { parseCookies, validateCookie, describeCookie, buildCookieScript } = require('./screenshot-cookie');

function printUsage() {
  console.log(`
Usage: pagesnap cookie <command> [options]

Commands:
  validate <json>    Validate cookie JSON (array or object)
  describe <json>    Human-readable summary of cookies
  script <json>      Output browser injection script for cookies

Examples:
  pagesnap cookie validate '[{"name":"session","value":"abc"}]'
  pagesnap cookie describe 'session=abc123'
  pagesnap cookie script '[{"name":"auth","value":"tok","secure":true}]'
`.trim());
}

function parseInput(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parseCookies(parsed);
  } catch {
    // try as plain name=value string
    return parseCookies(raw);
  }
}

function cmdValidate(args) {
  const raw = args[0];
  if (!raw) { console.error('Error: provide cookie JSON or name=value string'); process.exit(1); }
  const cookies = parseInput(raw);
  let ok = true;
  for (const c of cookies) {
    const errs = validateCookie(c);
    if (errs.length) {
      errs.forEach(e => console.error(`  ✗ ${c.name ?? '?'}: ${e}`));
      ok = false;
    } else {
      console.log(`  ✓ ${c.name}`);
    }
  }
  if (!ok) process.exit(1);
}

function cmdDescribe(args) {
  const raw = args[0];
  if (!raw) { console.error('Error: provide cookie JSON or name=value string'); process.exit(1); }
  const cookies = parseInput(raw);
  cookies.forEach((c, i) => console.log(`[${i + 1}] ${describeCookie(c)}`));
}

function cmdScript(args) {
  const raw = args[0];
  if (!raw) { console.error('Error: provide cookie JSON'); process.exit(1); }
  const cookies = parseInput(raw);
  const script = buildCookieScript(cookies);
  console.log(script || '// no cookies');
}

function runCookieCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') { printUsage(); return; }
  if (cmd === 'validate') cmdValidate(rest);
  else if (cmd === 'describe') cmdDescribe(rest);
  else if (cmd === 'script') cmdScript(rest);
  else { console.error(`Unknown command: ${cmd}`); printUsage(); process.exit(1); }
}

if (require.main === module) runCookieCli();
module.exports = { runCookieCli, printUsage };
