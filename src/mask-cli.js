#!/usr/bin/env node
// mask-cli.js — CLI helpers for listing/validating mask configs

const { parseMasks, describeMask } = require('./mask');

function printUsage() {
  console.log(`
Usage: pagesnap mask <command> [options]

Commands:
  validate <region...>   Validate one or more mask region strings
  list <region...>       Parse and list mask regions

Region format: "x,y,width,height"  (e.g. "0,0,300,60")
`.trim());
}

function cmdValidate(args) {
  if (!args.length) {
    console.error('No regions provided.');
    process.exit(1);
  }
  let ok = true;
  for (const arg of args) {
    try {
      const r = parseMasks([arg])[0];
      console.log(`✓  ${arg}  →  ${describeMask(r)}`);
    } catch (err) {
      console.error(`✗  ${arg}  →  ${err.message}`);
      ok = false;
    }
  }
  if (!ok) process.exit(1);
}

function cmdList(args) {
  if (!args.length) {
    console.log('(no regions)');
    return;
  }
  try {
    const masks = parseMasks(args);
    masks.forEach((m, i) => {
      console.log(`  [${i}] ${describeMask(m)}  color=rgb(${m.color.join(',')})`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

function runMaskCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    return;
  }
  if (cmd === 'validate') return cmdValidate(rest);
  if (cmd === 'list') return cmdList(rest);
  console.error(`Unknown mask command: ${cmd}`);
  printUsage();
  process.exit(1);
}

module.exports = { runMaskCli, cmdValidate, cmdList };

if (require.main === module) runMaskCli();
