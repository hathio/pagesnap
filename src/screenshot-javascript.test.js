const {
  parseJsAction,
  parseJsActions,
  buildJsScript,
  describeJsAction,
  buildEvalContext,
} = require('./screenshot-javascript');

test('parseJsAction returns script for valid string', () => {
  const result = parseJsAction('document.title = "test"');
  expect(result).toEqual({ script: 'document.title = "test"' });
});

test('parseJsAction trims whitespace', () => {
  const result = parseJsAction('  window.scrollTo(0, 0);  ');
  expect(result.script).toBe('window.scrollTo(0, 0);');
});

test('parseJsAction throws on empty string', () => {
  expect(() => parseJsAction('')).toThrow('non-empty string');
});

test('parseJsAction throws on non-string', () => {
  expect(() => parseJsAction(null)).toThrow();
  expect(() => parseJsAction(42)).toThrow();
});

test('parseJsAction throws if script too long', () => {
  const huge = 'x'.repeat(10001);
  expect(() => parseJsAction(huge)).toThrow('max length');
});

test('parseJsActions returns empty array for no input', () => {
  expect(parseJsActions(null)).toEqual([]);
  expect(parseJsActions(undefined)).toEqual([]);
});

test('parseJsActions handles single string', () => {
  const result = parseJsActions('alert(1)');
  expect(result).toHaveLength(1);
  expect(result[0].script).toBe('alert(1)');
});

test('parseJsActions handles array', () => {
  const result = parseJsActions(['a()', 'b()']);
  expect(result).toHaveLength(2);
});

test('parseJsActions wraps error with index', () => {
  expect(() => parseJsActions(['ok()', ''])).toThrow('JS action[1]');
});

test('buildJsScript returns empty string for no actions', () => {
  expect(buildJsScript([])).toBe('');
});

test('buildJsScript wraps each script in async iife', () => {
  const actions = [{ script: 'console.log(1)' }, { script: 'console.log(2)' }];
  const script = buildJsScript(actions);
  expect(script).toContain('async');
  expect(script.split('\n')).toHaveLength(2);
});

test('describeJsAction truncates long scripts', () => {
  const long = 'x'.repeat(80);
  const desc = describeJsAction({ script: long });
  expect(desc.length).toBeLessThan(80);
  expect(desc).toContain('...');
});

test('buildEvalContext returns combined script and count', () => {
  const actions = parseJsActions(['a()', 'b()']);
  const ctx = buildEvalContext(actions);
  expect(ctx.count).toBe(2);
  expect(ctx.scripts).toHaveLength(2);
  expect(typeof ctx.combined).toBe('string');
});
