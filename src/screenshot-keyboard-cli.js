#!/usr/bin/env node
// screenshot-keyboard-cli.js — CLI helpers for keyboard action config

const { parseKeyActions, buildKeyboardScript, describeKeyboard } = require('./screenshot-keyboard');

function printUsage() {
  console.log(`
Usage: pagesnap keyboard <cmd> [options]

Commands:
  validate  <json>   Validate a keyboard action or array of actions
  describe  <json>   Human-readable description of keyboard actions
  script    <json>   Print the Playwright script snippet

Examples:
  pagesnap keyboard validate '{"key":"Enter"}'
  pagesnap keyboard describe '[{"key":"a","modifiers":["Control"]}]'
  pagesnap keyboard script '{"key":"Tab","delay":200}'
`.trim());
}

function parseInput(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON: ${raw}`);
  }
}

function cmdValidate(raw) {
  const input = parseInput(raw);
  const actions = parseKeyActions(input);
  console.log(`✓ Valid — ${actions.length} action(s)`);
  actions.forEach((a, i) => {
    const mods = a.modifiers.length ? ` modifiers=[${a.modifiers.join(',')}]` : '';
    console.log(`  [${i}] type=${a.type} key="${a.key}"${mods} delay=${a.delay}ms`);
  });
}

function cmdDescribe(raw) {
  const input = parseInput(raw);
  const actions = parseKeyActions(input);
  console.log(describeKeyboard(actions));
}

function cmdScript(raw) {
  const input = parseInput(raw);
  const actions = parseKeyActions(input);
  const script = buildKeyboardScript(actions);
  console.log(script || '// no actions');
}

function runKeyboardCli(argv) {
  const [cmd, ...rest] = argv;
  const arg = rest[0];
  switch (cmd) {
    case 'validate': return cmdValidate(arg);
    case 'describe': return cmdDescribe(arg);
    case 'script':   return cmdScript(arg);
    default:
      printUsage();
      if (cmd) process.exitCode = 1;
  }
}

if (require.main === module) {
  runKeyboardCli(process.argv.slice(2));
}

module.exports = { printUsage, parseInput, cmdValidate, cmdDescribe, cmdScript, runKeyboardCli };
