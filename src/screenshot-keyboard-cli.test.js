const { runKeyboardCli, parseInput } = require('./screenshot-keyboard-cli');

function captureOutput(fn) {
  const lines = [];
  const orig = console.log;
  console.log = (...args) => lines.push(args.join(' '));
  try { fn(); } finally { console.log = orig; }
  return lines.join('\n');
}

describe('parseInput', () => {
  it('parses valid JSON', () => {
    expect(parseInput('{"key":"Enter"}')).toEqual({ key: 'Enter' });
  });
  it('throws on invalid JSON', () => {
    expect(() => parseInput('not-json')).toThrow('Invalid JSON');
  });
});

describe('runKeyboardCli validate', () => {
  it('prints valid message for single action', () => {
    const out = captureOutput(() => runKeyboardCli(['validate', '{"key":"Tab"}']));
    expect(out).toContain('Valid');
    expect(out).toContain('1 action');
  });

  it('shows modifier info', () => {
    const out = captureOutput(() =>
      runKeyboardCli(['validate', '{"key":"a","modifiers":["Control"]}'])
    );
    expect(out).toContain('Control');
  });

  it('throws for invalid action', () => {
    expect(() =>
      captureOutput(() => runKeyboardCli(['validate', '{"key":""}']))
    ).toThrow();
  });
});

describe('runKeyboardCli describe', () => {
  it('outputs human-readable description', () => {
    const out = captureOutput(() =>
      runKeyboardCli(['describe', '[{"key":"Enter"},{"key":"Tab"}]'])
    );
    expect(out).toContain('Enter');
    expect(out).toContain('Tab');
  });
});

describe('runKeyboardCli script', () => {
  it('outputs a playwright script snippet', () => {
    const out = captureOutput(() =>
      runKeyboardCli(['script', '{"key":"Enter"}'])
    );
    expect(out).toContain('keyboard.press');
  });

  it('outputs no-action comment for empty array', () => {
    const out = captureOutput(() => runKeyboardCli(['script', '[]']));
    expect(out).toContain('no actions');
  });
});

describe('runKeyboardCli unknown command', () => {
  it('prints usage and sets exit code', () => {
    const out = captureOutput(() => runKeyboardCli(['unknown']));
    expect(out).toContain('Usage');
    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
