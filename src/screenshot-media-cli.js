#!/usr/bin/env node
// screenshot-media-cli.js — CLI for media type/reduced-motion options

const { parseMediaOptions, applyPreset, buildMediaScript, describeMedia, listPresets } = require('./screenshot-media');

function printUsage() {
  console.log(`
Usage: pagesnap media <command> [options]

Commands:
  list                    List available media presets
  describe <type>         Describe a media type or preset
  validate --type <t>     Validate media options
  script --type <t>       Output browser script for media options

Options:
  --type <screen|print>   Media type (default: screen)
  --reduced-motion        Enable prefers-reduced-motion
  --preset <name>         Use a named preset
`.trim());
}

function cmdList() {
  const presets = listPresets();
  console.log('Available media presets:\n');
  for (const p of presets) {
    const rm = p.reducedMotion ? ' [reduced-motion]' : '';
    console.log(`  ${p.name.padEnd(14)} type=${p.type}${rm}`);
  }
}

function cmdDescribe(args) {
  const name = args[0];
  let opts;
  try {
    opts = name ? applyPreset(name) : parseMediaOptions({});
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  console.log(describeMedia(opts));
}

function cmdValidate(args) {
  const typeIdx = args.indexOf('--type');
  const type = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
  const reducedMotion = args.includes('--reduced-motion');
  try {
    const opts = parseMediaOptions({ type, reducedMotion });
    console.log('Valid:', describeMedia(opts));
  } catch (e) {
    console.error('Invalid:', e.message);
    process.exit(1);
  }
}

function cmdScript(args) {
  const typeIdx = args.indexOf('--type');
  const type = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
  const reducedMotion = args.includes('--reduced-motion');
  const presetIdx = args.indexOf('--preset');
  let opts;
  try {
    opts = presetIdx !== -1 ? applyPreset(args[presetIdx + 1]) : parseMediaOptions({ type, reducedMotion });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  const script = buildMediaScript(opts);
  console.log(script || '// no browser script needed for default options');
}

function runMediaCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;
  switch (cmd) {
    case 'list': return cmdList();
    case 'describe': return cmdDescribe(rest);
    case 'validate': return cmdValidate(rest);
    case 'script': return cmdScript(rest);
    default: printUsage();
  }
}

if (require.main === module) runMediaCli();
module.exports = { runMediaCli };
