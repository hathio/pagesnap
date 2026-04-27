const { parseMediaOptions, applyPreset, buildMediaScript, describeMedia, listPresets } = require('./screenshot-media');

describe('parseMediaOptions', () => {
  test('defaults to screen type', () => {
    const opts = parseMediaOptions({});
    expect(opts.type).toBe('screen');
    expect(opts.reducedMotion).toBe(false);
  });

  test('accepts print type', () => {
    const opts = parseMediaOptions({ type: 'print' });
    expect(opts.type).toBe('print');
  });

  test('accepts mediaType alias', () => {
    const opts = parseMediaOptions({ mediaType: 'print' });
    expect(opts.type).toBe('print');
  });

  test('accepts reducedMotion flag', () => {
    const opts = parseMediaOptions({ reducedMotion: true });
    expect(opts.reducedMotion).toBe(true);
  });

  test('throws on invalid type', () => {
    expect(() => parseMediaOptions({ type: 'fax' })).toThrow('Invalid media type');
  });
});

describe('applyPreset', () => {
  test('returns screen preset', () => {
    const p = applyPreset('screen');
    expect(p.type).toBe('screen');
    expect(p.reducedMotion).toBe(false);
  });

  test('returns accessible preset with reduced motion', () => {
    const p = applyPreset('accessible');
    expect(p.reducedMotion).toBe(true);
  });

  test('throws on unknown preset', () => {
    expect(() => applyPreset('nope')).toThrow('Unknown media preset');
  });
});

describe('buildMediaScript', () => {
  test('returns empty string for default screen', () => {
    const script = buildMediaScript({ type: 'screen', reducedMotion: false });
    expect(script).toBe('');
  });

  test('emulates print media', () => {
    const script = buildMediaScript({ type: 'print', reducedMotion: false });
    expect(script).toContain("emulateMediaType('print')");
  });

  test('emulates reduced motion', () => {
    const script = buildMediaScript({ type: 'screen', reducedMotion: true });
    expect(script).toContain('prefers-reduced-motion');
  });
});

describe('describeMedia', () => {
  test('describes basic options', () => {
    const desc = describeMedia({ type: 'print', reducedMotion: false });
    expect(desc).toContain('print');
  });

  test('mentions reduced motion when enabled', () => {
    const desc = describeMedia({ type: 'screen', reducedMotion: true });
    expect(desc).toContain('reduced-motion');
  });
});

describe('listPresets', () => {
  test('returns array of presets', () => {
    const presets = listPresets();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.some(p => p.name === 'print')).toBe(true);
    expect(presets.some(p => p.name === 'accessible')).toBe(true);
  });
});
