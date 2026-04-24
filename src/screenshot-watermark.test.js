const { parseWatermarkOptions, describeWatermark, buildWatermarkScript, POSITIONS } = require('./screenshot-watermark');

describe('parseWatermarkOptions', () => {
  test('returns null for empty/null input', () => {
    expect(parseWatermarkOptions()).toBeNull();
    expect(parseWatermarkOptions({})).toBeNull();
    expect(parseWatermarkOptions(null)).toBeNull();
  });

  test('parses text watermark with defaults', () => {
    const result = parseWatermarkOptions({ text: 'staging' });
    expect(result).toMatchObject({
      type: 'text',
      text: 'staging',
      position: 'bottom-right',
      opacity: 0.5,
      fontSize: 14,
      color: '#ffffff',
      padding: 8,
    });
  });

  test('parses image watermark', () => {
    const result = parseWatermarkOptions({ image: '/path/to/logo.png', position: 'top-left', opacity: 0.8 });
    expect(result).toMatchObject({ type: 'image', image: '/path/to/logo.png', position: 'top-left', opacity: 0.8 });
  });

  test('throws if both text and image provided', () => {
    expect(() => parseWatermarkOptions({ text: 'hi', image: 'logo.png' })).toThrow('either text or image');
  });

  test('throws on invalid position', () => {
    expect(() => parseWatermarkOptions({ text: 'x', position: 'middle' })).toThrow('invalid position');
  });

  test('throws on invalid opacity', () => {
    expect(() => parseWatermarkOptions({ text: 'x', opacity: 1.5 })).toThrow('opacity');
    expect(() => parseWatermarkOptions({ text: 'x', opacity: -0.1 })).toThrow('opacity');
  });

  test('throws on invalid fontSize', () => {
    expect(() => parseWatermarkOptions({ text: 'x', fontSize: 2 })).toThrow('fontSize');
    expect(() => parseWatermarkOptions({ text: 'x', fontSize: 999 })).toThrow('fontSize');
  });

  test('accepts all valid positions', () => {
    for (const pos of POSITIONS) {
      expect(() => parseWatermarkOptions({ text: 'x', position: pos })).not.toThrow();
    }
  });
});

describe('describeWatermark', () => {
  test('returns no watermark for null', () => {
    expect(describeWatermark(null)).toBe('no watermark');
  });

  test('describes text watermark', () => {
    const opts = parseWatermarkOptions({ text: 'preview', position: 'top-right', opacity: 0.7 });
    expect(describeWatermark(opts)).toContain('"preview"');
    expect(describeWatermark(opts)).toContain('top-right');
    expect(describeWatermark(opts)).toContain('0.7');
  });

  test('describes image watermark', () => {
    const opts = parseWatermarkOptions({ image: 'logo.png' });
    expect(describeWatermark(opts)).toContain('logo.png');
  });
});

describe('buildWatermarkScript', () => {
  test('returns null when no opts', () => {
    expect(buildWatermarkScript(null)).toBeNull();
  });

  test('returns serializable config', () => {
    const opts = parseWatermarkOptions({ text: 'draft', fontSize: 18, color: '#ff0000' });
    const script = buildWatermarkScript(opts);
    expect(script.enabled).toBe(true);
    expect(script.text).toBe('draft');
    expect(script.fontSize).toBe(18);
    expect(script.color).toBe('#ff0000');
    expect(JSON.stringify(script)).toBeTruthy();
  });
});
