const { parseFullPageOptions, buildFullPageScript, describeFullPage, listModes, clampScrollPause } = require('./screenshot-fullpage');

test('parseFullPageOptions defaults', () => {
  const opts = parseFullPageOptions();
  expect(opts.mode).toBe('native');
  expect(opts.scrollPause).toBe(150);
  expect(opts.maxHeight).toBeNull();
  expect(opts.lazySelector).toBeNull();
});

test('parseFullPageOptions accepts valid mode', () => {
  expect(parseFullPageOptions({ mode: 'stitch' }).mode).toBe('stitch');
  expect(parseFullPageOptions({ mode: 'lazy' }).mode).toBe('lazy');
});

test('parseFullPageOptions falls back to native for unknown mode', () => {
  expect(parseFullPageOptions({ mode: 'bogus' }).mode).toBe('native');
});

test('parseFullPageOptions clamps scrollPause', () => {
  expect(parseFullPageOptions({ scrollPause: -100 }).scrollPause).toBe(0);
  expect(parseFullPageOptions({ scrollPause: 99999 }).scrollPause).toBe(5000);
  expect(parseFullPageOptions({ scrollPause: 300 }).scrollPause).toBe(300);
});

test('parseFullPageOptions sets maxHeight and lazySelector', () => {
  const opts = parseFullPageOptions({ maxHeight: 8000, lazySelector: '.img-lazy' });
  expect(opts.maxHeight).toBe(8000);
  expect(opts.lazySelector).toBe('.img-lazy');
});

test('buildFullPageScript returns null for native mode', () => {
  const opts = parseFullPageOptions({ mode: 'native' });
  expect(buildFullPageScript(opts)).toBeNull();
});

test('buildFullPageScript returns scroll script for stitch mode', () => {
  const opts = parseFullPageOptions({ mode: 'stitch', scrollPause: 200 });
  const script = buildFullPageScript(opts);
  expect(script).toContain('scrollBy');
  expect(script).toContain('200');
});

test('buildFullPageScript uses lazySelector in lazy mode', () => {
  const opts = parseFullPageOptions({ mode: 'lazy', lazySelector: '.lazy-img' });
  const script = buildFullPageScript(opts);
  expect(script).toContain('.lazy-img');
  expect(script).toContain('querySelectorAll');
});

test('describeFullPage native mode', () => {
  const desc = describeFullPage(parseFullPageOptions());
  expect(desc).toContain('native');
});

test('describeFullPage stitch mode includes scrollPause', () => {
  const desc = describeFullPage(parseFullPageOptions({ mode: 'stitch', scrollPause: 250 }));
  expect(desc).toContain('stitch');
  expect(desc).toContain('250ms');
});

test('listModes returns all modes', () => {
  const modes = listModes();
  expect(modes.map(m => m.name)).toEqual(['native', 'stitch', 'lazy']);
});

test('clampScrollPause boundaries', () => {
  expect(clampScrollPause(0)).toBe(0);
  expect(clampScrollPause(5000)).toBe(5000);
  expect(clampScrollPause(5001)).toBe(5000);
});
