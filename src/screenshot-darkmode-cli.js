#!/usr/bin/env node
// screenshot-darkmode-cli.js — CLI helpers for dark mode emulation

const { parseDarkMode, buildDarkModeContext, describeDarkMode, listSchemes } = require('./screenshot-darkmode');

function printUsage() {
  console.log(`
Usage: pagesnap darkmode <command> [options]

Commands:
  list                List valid color schemes
  describe <scheme>   Describe a color scheme setting
  validate <scheme>   Validate a color scheme value
  context <scheme>    Print browser context options as JSON

Examples:
  pagesnap darkmode list
  pagesnap darkmode describe dark
  pagesnap darkmode validate no-preference
  pagesnap darkmode context dark
`.trim());
}

function cmdList() {
  const schemes = listSchemes();
  console.log('Available color schemes:');
  schemes.forEach(s => console.log(`  ${s}`));
}

function cmdDescribe(args) {
  const scheme = args[0];
  if (!scheme) { console.error('Error: scheme required'); process.exit(1); }
  try {
    const opts = parseDarkMode(scheme);
    console.log(describeDarkMode(opts));
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

function cmdValidate(args) {
  const scheme = args[0];
  if (!scheme) { console.error('Error: scheme required'); process.exit(1); }
  try {
    parseDarkMode(scheme);
    console.log(`✓ "${scheme}" is a valid color scheme`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}

function cmdContext(args) {
  const scheme = args[0];
  if (!scheme) { console.error('Error: scheme required'); process.exit(1); }
  try {
    const opts = parseDarkMode(scheme);
    const ctx = buildDarkModeContext(opts);
    console.log(JSON.stringify(ctx, null, 2));
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  }
}

function runDarkModeCli(argv) {
  const [cmd, ...rest] = argv;
  switch (cmd) {
    case 'list':     return cmdList();
    case 'describe': return cmdDescribe(rest);
    case 'validate': return cmdValidate(rest);
    case 'context':  return cmdContext(rest);
    default:
      printUsage();
      if (cmd) process.exit(1);
  }
}

if (require.main === module) {
  runDarkModeCli(process.argv.slice(2));
}

module.exports = { runDarkModeCli, cmdList, cmdDescribe, cmdValidate, cmdContext };
