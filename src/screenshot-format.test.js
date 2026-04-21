const {
  parseFormat,
  buildScreenshotOptions,
  formatExtension,
  describeFormat,
  SUPPORTED_FORMATS,
} = require('./screenshot-format');

test('parseFormat defaults to png', () => {
  expect(parseFormat()).toBe('png');
  expect(parseFormat(null)).toBe('png');
  expect(parseFormat('')).toBe('png');
});

test('parseFormat accepts valid formats', () => {
  for (const fmt of SUPPORTED_FORMATS) {
    expect(parseFormat(fmt)).toBe(fmt);
  }
});

test('parseFormat is case-insensitive', () => {
  expect(parseFormat('PNG')).toBe('png');
  expect(parseFormat('JPEG')).toBe('jpeg');
  expect(parseFormat('WebP')).toBe('webp');
});

test('parseFormat throws on unsupported format', () => {
  expect(() => parseFormat('bmp')).toThrow('Unsupported screenshot format');
  expect(() => parseFormat('gif')).toThrow('Unsupported screenshot format');
});

test('buildScreenshotOptions for png omits quality', () => {
  const opts = buildScreenshotOptions('png');
  expect(opts.type).toBe('png');
  expect(opts).not.toHaveProperty('quality');
});

test('buildScreenshotOptions for jpeg includes quality', () => {
  const opts = buildScreenshotOptions('jpeg');
  expect(opts.type).toBe('jpeg');
  expect(opts.quality).toBe(80);
});

test('buildScreenshotOptions respects quality override', () => {
  const opts = buildScreenshotOptions('webp', { quality: 60 });
  expect(opts.quality).toBe(60);
});

test('buildScreenshotOptions ignores quality override for png', () => {
  const opts = buildScreenshotOptions('png', { quality: 90 });
  expect(opts).not.toHaveProperty('quality');
});

test('formatExtension returns dot-prefixed extension', () => {
  expect(formatExtension('png')).toBe('.png');
  expect(formatExtension('jpeg')).toBe('.jpeg');
  expect(formatExtension('webp')).toBe('.webp');
});

test('describeFormat returns readable string', () => {
  expect(describeFormat('png')).toContain('png');
  expect(describeFormat('jpeg')).toContain('quality');
  expect(describeFormat('webp')).toContain('image/webp');
});

test('describeFormat handles unknown format gracefully', () => {
  expect(describeFormat('bmp')).toContain('unknown');
});
