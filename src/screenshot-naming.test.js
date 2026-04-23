const {
  slugify,
  formatTimestamp,
  resolveScreenshotName,
  resolveScreenshotPath,
  parseNamingPattern,
  validateNamingPattern,
  DEFAULT_PATTERN,
} = require('./screenshot-naming');
const path = require('path');

test('slugify strips protocol and special chars', () => {
  expect(slugify('https://example.com/foo/bar')).toBe('example_com_foo_bar');
  expect(slugify('http://my-site.io:3000/page?q=1')).toBe('my_site_io_3000_page_q_1');
});

test('slugify trims leading/trailing underscores', () => {
  expect(slugify('https://example.com/')).toBe('example_com');
});

test('formatTimestamp returns fixed-length string without colons', () => {
  const ts = formatTimestamp(new Date('2024-06-15T12:34:56.000Z'));
  expect(ts).toBe('2024-06-15_12-34-56');
  expect(ts).toHaveLength(19);
});

test('resolveScreenshotName uses default pattern', () => {
  const name = resolveScreenshotName('https://example.com', '1280x800', {
    timestamp: '2024-01-01_00-00-00',
  });
  expect(name).toBe('example_com_1280x800_2024-01-01_00-00-00.png');
});

test('resolveScreenshotName respects custom pattern', () => {
  const name = resolveScreenshotName('https://foo.io/page', { width: 375, height: 667 }, {
    pattern: '{slug}_{viewport}',
    timestamp: 'ts',
  });
  expect(name).toBe('foo_io_page_375x667.png');
});

test('resolveScreenshotName throws on unknown token', () => {
  expect(() =>
    resolveScreenshotName('https://x.com', '800x600', {
      pattern: '{slug}_{unknown}',
      timestamp: 'ts',
    })
  ).toThrow('Unknown naming token: {unknown}');
});

test('resolveScreenshotPath joins baseDir and filename', () => {
  const p = resolveScreenshotPath('/snaps', 'https://example.com', '1024x768', {
    timestamp: '2024-01-01_00-00-00',
  });
  expect(p).toBe(path.join('/snaps', 'example_com_1024x768_2024-01-01_00-00-00.png'));
});

test('parseNamingPattern extracts tokens', () => {
  const result = parseNamingPattern('{slug}_{viewport}_{tag}');
  expect(result.tokens).toEqual(['slug', 'viewport', 'tag']);
});

test('validateNamingPattern accepts valid pattern', () => {
  expect(validateNamingPattern(DEFAULT_PATTERN).valid).toBe(true);
});

test('validateNamingPattern rejects unknown tokens', () => {
  const result = validateNamingPattern('{slug}_{bad}');
  expect(result.valid).toBe(false);
  expect(result.unknown).toContain('bad');
});
