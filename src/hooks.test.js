const { buildHookContext, runLifecycleHooks, runHook } = require('./hooks');

const sampleResults = [
  { url: 'http://localhost/a', diffPercent: 0 },
  { url: 'http://localhost/b', diffPercent: 5.2 },
  { url: 'http://localhost/c', error: 'crash' },
];

test('buildHookContext counts correctly', () => {
  const ctx = buildHookContext('after-diff', sampleResults);
  expect(ctx.event).toBe('after-diff');
  expect(ctx.total).toBe(3);
  expect(ctx.changed).toBe(1);
  expect(ctx.errors).toBe(1);
});

test('buildHookContext with empty results', () => {
  const ctx = buildHookContext('after-capture', []);
  expect(ctx.total).toBe(0);
  expect(ctx.changed).toBe(0);
});

test('runHook does nothing when cmd is falsy', () => {
  expect(() => runHook(null)).not.toThrow();
  expect(() => runHook('')).not.toThrow();
  expect(() => runHook(undefined)).not.toThrow();
});

test('runHook executes a real command', () => {
  expect(() => runHook('echo pagesnap-hook-test')).not.toThrow();
});

test('runLifecycleHooks skips when no hook defined', async () => {
  await expect(runLifecycleHooks({}, 'after-diff', sampleResults)).resolves.toBeUndefined();
});

test('runLifecycleHooks runs matching hook', async () => {
  const config = { hooks: { 'after-diff': 'echo hook-ran' } };
  await expect(runLifecycleHooks(config, 'after-diff', sampleResults)).resolves.toBeUndefined();
});

test('runLifecycleHooks skips non-matching event', async () => {
  const config = { hooks: { 'after-capture': 'echo capture' } };
  await expect(runLifecycleHooks(config, 'after-diff', [])).resolves.toBeUndefined();
});
