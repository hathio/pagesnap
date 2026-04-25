const { parseHoverOptions, buildHoverScript, describeHover, parseHoverTarget } = require('./screenshot-hover');

describe('parseHoverTarget', () => {
  test('returns trimmed selector string', () => {
    expect(parseHoverTarget('  .btn  ')).toBe('.btn');
  });
  test('returns null for empty string', () => {
    expect(parseHoverTarget('')).toBeNull();
  });
  test('returns null for null/undefined', () => {
    expect(parseHoverTarget(null)).toBeNull();
    expect(parseHoverTarget(undefined)).toBeNull();
  });
});

describe('parseHoverOptions', () => {
  test('defaults: trigger css, delay 200, restoreAfter true', () => {
    const opts = parseHoverOptions({ selector: '.nav' });
    expect(opts.trigger).toBe('css');
    expect(opts.delay).toBe(200);
    expect(opts.restoreAfter).toBe(true);
    expect(opts.selector).toBe('.nav');
  });

  test('accepts js trigger', () => {
    const opts = parseHoverOptions({ selector: '#btn', trigger: 'js', delay: 100 });
    expect(opts.trigger).toBe('js');
    expect(opts.delay).toBe(100);
  });

  test('throws on invalid trigger', () => {
    expect(() => parseHoverOptions({ trigger: 'magic' })).toThrow('Invalid hover trigger');
  });

  test('clamps negative delay to 0', () => {
    const opts = parseHoverOptions({ delay: -50 });
    expect(opts.delay).toBe(0);
  });

  test('restoreAfter can be disabled', () => {
    const opts = parseHoverOptions({ restoreAfter: false });
    expect(opts.restoreAfter).toBe(false);
  });
});

describe('buildHoverScript', () => {
  test('returns null when no selector', () => {
    expect(buildHoverScript({ selector: null, trigger: 'css', delay: 200 })).toBeNull();
  });

  test('returns null for trigger none', () => {
    expect(buildHoverScript({ selector: '.btn', trigger: 'none', delay: 0 })).toBeNull();
  });

  test('js trigger script dispatches mouseover', () => {
    const script = buildHoverScript({ selector: '.btn', trigger: 'js', delay: 150, restoreAfter: true });
    expect(script).toContain('mouseover');
    expect(script).toContain('.btn');
    expect(script).toContain('150');
  });

  test('css trigger adds pagesnap-hover class', () => {
    const script = buildHoverScript({ selector: '#hero', trigger: 'css', delay: 200, restoreAfter: true });
    expect(script).toContain('pagesnap-hover');
    expect(script).toContain('#hero');
  });
});

describe('describeHover', () => {
  test('returns no hover when no selector', () => {
    expect(describeHover(null)).toBe('no hover');
    expect(describeHover({ selector: null })).toBe('no hover');
  });

  test('describes hover options', () => {
    const desc = describeHover({ selector: '.menu', trigger: 'js', delay: 300, restoreAfter: false });
    expect(desc).toContain('.menu');
    expect(desc).toContain('js');
    expect(desc).toContain('300ms');
  });
});
