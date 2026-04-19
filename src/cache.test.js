const fs = require('fs');
const os = require('os');
const path = require('path');
const { getCacheDir, hashUrl, getCacheEntry, setCacheEntry, isCacheFresh, clearCache } = require('./cache');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-cache-test-'));
}

test('hashUrl returns consistent hex string', () => {
  const h = hashUrl('https://example.com');
  expect(h).toMatch(/^[a-f0-9]{32}$/);
  expect(hashUrl('https://example.com')).toBe(h);
});

test('getCacheEntry returns null when missing', () => {
  const dir = makeTmpDir();
  expect(getCacheEntry(dir, 'https://example.com')).toBeNull();
});

test('setCacheEntry and getCacheEntry round-trip', () => {
  const dir = makeTmpDir();
  setCacheEntry(dir, 'https://example.com', { status: 200 });
  const entry = getCacheEntry(dir, 'https://example.com');
  expect(entry).not.toBeNull();
  expect(entry.url).toBe('https://example.com');
  expect(entry.status).toBe(200);
  expect(typeof entry.timestamp).toBe('number');
});

test('isCacheFresh returns true for fresh entry', () => {
  const entry = { timestamp: Date.now() };
  expect(isCacheFresh(entry)).toBe(true);
});

test('isCacheFresh returns false for old entry', () => {
  const entry = { timestamp: Date.now() - 10 * 60 * 1000 };
  expect(isCacheFresh(entry)).toBe(false);
});

test('clearCache removes all entries', () => {
  const dir = makeTmpDir();
  setCacheEntry(dir, 'https://a.com', {});
  setCacheEntry(dir, 'https://b.com', {});
  clearCache(dir);
  expect(getCacheEntry(dir, 'https://a.com')).toBeNull();
  expect(getCacheEntry(dir, 'https://b.com')).toBeNull();
});

test('getCacheDir returns expected path', () => {
  expect(getCacheDir('/some/base')).toBe('/some/base/.pagesnap-cache');
});
