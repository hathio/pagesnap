const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getStorageRoot, ensureDir, writeFile, readFile,
  deleteFile, listFiles, moveFile, storageStat
} = require('./storage');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-storage-'));
}

test('getStorageRoot returns .pagesnap under base', () => {
  expect(getStorageRoot('/foo')).toBe('/foo/.pagesnap');
});

test('ensureDir creates directory', () => {
  const tmp = makeTmpDir();
  const dir = path.join(tmp, 'a', 'b');
  ensureDir(dir);
  expect(fs.existsSync(dir)).toBe(true);
});

test('writeFile and readFile round-trip', () => {
  const tmp = makeTmpDir();
  const fp = path.join(tmp, 'sub', 'file.txt');
  writeFile(fp, 'hello');
  expect(readFile(fp).toString()).toBe('hello');
});

test('readFile returns null for missing file', () => {
  const tmp = makeTmpDir();
  expect(readFile(path.join(tmp, 'nope.txt'))).toBeNull();
});

test('deleteFile removes file and returns true', () => {
  const tmp = makeTmpDir();
  const fp = path.join(tmp, 'del.txt');
  writeFile(fp, 'bye');
  expect(deleteFile(fp)).toBe(true);
  expect(fs.existsSync(fp)).toBe(false);
});

test('deleteFile returns false for missing file', () => {
  const tmp = makeTmpDir();
  expect(deleteFile(path.join(tmp, 'ghost.txt'))).toBe(false);
});

test('listFiles returns files with extension filter', () => {
  const tmp = makeTmpDir();
  writeFile(path.join(tmp, 'a.png'), '');
  writeFile(path.join(tmp, 'b.png'), '');
  writeFile(path.join(tmp, 'c.txt'), '');
  const pngs = listFiles(tmp, '.png');
  expect(pngs).toHaveLength(2);
});

test('moveFile moves file to new location', () => {
  const tmp = makeTmpDir();
  const src = path.join(tmp, 'src.txt');
  const dest = path.join(tmp, 'nested', 'dest.txt');
  writeFile(src, 'data');
  moveFile(src, dest);
  expect(fs.existsSync(src)).toBe(false);
  expect(fs.readFileSync(dest).toString()).toBe('data');
});

test('storageStat returns null for missing file', () => {
  const tmp = makeTmpDir();
  expect(storageStat(path.join(tmp, 'x'))).toBeNull();
});
