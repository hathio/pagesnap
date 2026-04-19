const { filterSnapshots, parseFilterArgs, matchesPattern } = require('./filter');

const snapshots = [
  { url: 'http://example.com/home', label: 'desktop', timestamp: '2024-01-10T10:00:00Z' },
  { url: 'http://example.com/about', label: 'mobile', timestamp: '2024-02-15T12:00:00Z' },
  { url: 'http://example.com/contact', label: 'desktop', timestamp: '2024-03-20T08:00:00Z' },
];

test('matchesPattern returns true when no pattern given', () => {
  expect(matchesPattern('http://example.com', undefined)).toBe(true);
});

test('matchesPattern matches string substring', () => {
  expect(matchesPattern('http://example.com/about', 'about')).toBe(true);
  expect(matchesPattern('http://example.com/home', 'about')).toBe(false);
});

test('matchesPattern matches regex', () => {
  expect(matchesPattern('http://example.com/about', /about|contact/)).toBe(true);
  expect(matchesPattern('http://example.com/home', /about|contact/)).toBe(false);
});

test('filterSnapshots with no opts returns all', () => {
  expect(filterSnapshots(snapshots)).toHaveLength(3);
});

test('filterSnapshots filters by pattern', () => {
  const result = filterSnapshots(snapshots, { pattern: 'about' });
  expect(result).toHaveLength(1);
  expect(result[0].url).toContain('about');
});

test('filterSnapshots filters by label', () => {
  const result = filterSnapshots(snapshots, { label: 'desktop' });
  expect(result).toHaveLength(2);
});

test('filterSnapshots filters by since', () => {
  const result = filterSnapshots(snapshots, { since: '2024-02-01T00:00:00Z' });
  expect(result).toHaveLength(2);
});

test('filterSnapshots filters by since and until', () => {
  const result = filterSnapshots(snapshots, {
    since: '2024-02-01T00:00:00Z',
    until: '2024-02-28T00:00:00Z',
  });
  expect(result).toHaveLength(1);
  expect(result[0].url).toContain('about');
});

test('parseFilterArgs handles plain string pattern', () => {
  const opts = parseFilterArgs({ pattern: 'home', label: 'desktop' });
  expect(opts.pattern).toBe('home');
  expect(opts.label).toBe('desktop');
});

test('parseFilterArgs handles regex-like pattern string', () => {
  const opts = parseFilterArgs({ pattern: '/home|about/' });
  expect(opts.pattern).toBeInstanceOf(RegExp);
});
