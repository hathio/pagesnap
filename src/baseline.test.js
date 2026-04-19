const fs = require('fs');
const path = require('path');
const os = require('os');
const { getBaselinePath, hasBaseline, copyToBaseline, deleteBaseline, listBaselines } = require('./baseline');
const { ensureSnapshotDirs } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-baseline-'));
}

function writePng(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.from('PNG'));
}

test('hasBaseline returns false when missing', () => {
  const dir = makeTmpDir();
  ensureSnapshotDirs(dir);
  expect(hasBaseline('home', dir)).toBe(false);
});

test('copyToBaseline copies current to baseline', () => {
  const dir = makeTmpDir();
  ensureSnapshotDirs(dir);
  writePng(path.join(dir, 'current', 'home.png'));
  const dest = copyToBaseline('home', dir);
  expect(fs.existsSync(dest)).toBe(true);
  expect(hasBaseline('home', dir)).toBe(true);
});

test('copyToBaseline throws if current missing', () => {
  const dir = makeTmpDir();
  ensureSnapshotDirs(dir);
  expect(() => copyToBaseline('missing', dir)).toThrow();
});

test('deleteBaseline removes file', () => {
  const dir = makeTmpDir();
  ensureSnapshotDirs(dir);
  writePng(path.join(dir, 'current', 'home.png'));
  copyToBaseline('home', dir);
  deleteBaseline('home', dir);
  expect(hasBaseline('home', dir)).toBe(false);
});

test('listBaselines returns names', () => {
  const dir = makeTmpDir();
  ensureSnapshotDirs(dir);
  writePng(path.join(dir, 'current', 'home.png'));
  writePng(path.join(dir, 'current', 'about.png'));
  copyToBaseline('home', dir);
  copyToBaseline('about', dir);
  const list = listBaselines(dir);
  expect(list.sort()).toEqual(['about', 'home']);
});
