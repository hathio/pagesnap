const { parseViewport, resolveViewports, describeViewport, listPresets } = require('./viewport');

describe('parseViewport', () => {
  test('returns desktop preset by default (no input)', () => {
    const vp = parseViewport(undefined);
    expect(vp).toEqual({ width: 1280, height: 800 });
  });

  test('resolves named preset (case-insensitive)', () => {
    expect(parseViewport('mobile')).toEqual({ width: 375, height: 812 });
    expect(parseViewport('TABLET')).toEqual({ width: 768, height: 1024 });
    expect(parseViewport('Wide')).toEqual({ width: 1920, height: 1080 });
  });

  test('parses WxH string', () => {
    expect(parseViewport('1024x768')).toEqual({ width: 1024, height: 768 });
    expect(parseViewport('800X600')).toEqual({ width: 800, height: 600 });
  });

  test('throws on invalid format', () => {
    expect(() => parseViewport('bad')).toThrow(/Invalid viewport/);
    expect(() => parseViewport('1280')).toThrow(/Invalid viewport/);
  });

  test('throws on zero dimensions', () => {
    expect(() => parseViewport('0x800')).toThrow(/positive integers/);
    expect(() => parseViewport('1280x0')).toThrow(/positive integers/);
  });
});

describe('resolveViewports', () => {
  test('returns single desktop viewport when no input', () => {
    const vps = resolveViewports(undefined);
    expect(vps).toHaveLength(1);
    expect(vps[0]).toMatchObject({ name: 'desktop', width: 1280, height: 800 });
  });

  test('resolves array of mixed specs', () => {
    const vps = resolveViewports(['mobile', '1440x900']);
    expect(vps).toHaveLength(2);
    expect(vps[0]).toMatchObject({ name: 'mobile', width: 375 });
    expect(vps[1]).toMatchObject({ name: '1440x900', width: 1440, height: 900 });
  });

  test('wraps single string in array', () => {
    const vps = resolveViewports('tablet');
    expect(vps).toHaveLength(1);
    expect(vps[0].name).toBe('tablet');
  });
});

describe('describeViewport', () => {
  test('formats viewport description', () => {
    const desc = describeViewport({ name: 'desktop', width: 1280, height: 800 });
    expect(desc).toBe('desktop (1280x800)');
  });
});

describe('listPresets', () => {
  test('returns all built-in presets', () => {
    const presets = listPresets();
    const names = presets.map((p) => p.name);
    expect(names).toEqual(expect.arrayContaining(['mobile', 'tablet', 'desktop', 'wide']));
    presets.forEach((p) => {
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    });
  });
});
