const { parseEmulateOptions, buildEmulateScript, describeEmulate, listPresets, DEVICE_PRESETS } = require('./screenshot-emulate');

describe('listPresets', () => {
  test('returns array of preset names', () => {
    const presets = listPresets();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets).toContain('iphone-14');
    expect(presets).toContain('ipad-pro');
    expect(presets).toContain('desktop-hd');
  });
});

describe('parseEmulateOptions', () => {
  test('returns null for empty input', () => {
    expect(parseEmulateOptions()).toBeNull();
    expect(parseEmulateOptions({})).toBeNull();
  });

  test('resolves known preset', () => {
    const opts = parseEmulateOptions({ preset: 'iphone-14' });
    expect(opts.preset).toBe('iphone-14');
    expect(opts.width).toBe(390);
    expect(opts.isMobile).toBe(true);
    expect(opts.hasTouch).toBe(true);
  });

  test('throws on unknown preset', () => {
    expect(() => parseEmulateOptions({ preset: 'nokia-3310' })).toThrow('Unknown device preset');
  });

  test('allows custom values to override preset', () => {
    const opts = parseEmulateOptions({ preset: 'iphone-14', width: 400 });
    expect(opts.width).toBe(400);
    expect(opts.height).toBe(844);
  });

  test('parses fully custom emulation', () => {
    const opts = parseEmulateOptions({ width: 800, height: 600, deviceScaleFactor: 2, isMobile: false });
    expect(opts.preset).toBeNull();
    expect(opts.width).toBe(800);
    expect(opts.deviceScaleFactor).toBe(2);
  });
});

describe('buildEmulateScript', () => {
  test('returns empty string for null', () => {
    expect(buildEmulateScript(null)).toBe('');
  });

  test('includes setViewport call', () => {
    const opts = parseEmulateOptions({ preset: 'pixel-7' });
    const script = buildEmulateScript(opts);
    expect(script).toContain('setViewport');
    expect(script).toContain('412');
  });

  test('includes setUserAgent when userAgent present', () => {
    const opts = parseEmulateOptions({ preset: 'iphone-se' });
    const script = buildEmulateScript(opts);
    expect(script).toContain('setUserAgent');
  });

  test('skips setUserAgent for desktop-hd preset', () => {
    const opts = parseEmulateOptions({ preset: 'desktop-hd' });
    const script = buildEmulateScript(opts);
    expect(script).not.toContain('setUserAgent');
  });
});

describe('describeEmulate', () => {
  test('describes null as no emulation', () => {
    expect(describeEmulate(null)).toBe('no device emulation');
  });

  test('describes preset by name', () => {
    const opts = parseEmulateOptions({ preset: 'ipad-pro' });
    const desc = describeEmulate(opts);
    expect(desc).toContain('ipad-pro');
  });

  test('describes custom emulation', () => {
    const opts = parseEmulateOptions({ width: 1280, height: 720, deviceScaleFactor: 1 });
    const desc = describeEmulate(opts);
    expect(desc).toContain('custom');
    expect(desc).toContain('1280x720');
  });
});
