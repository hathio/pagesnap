const fs = require('fs');
const path = require('path');

const DEFAULT_STORAGE_DIR = '.pagesnap';

function getStorageRoot(base = process.cwd()) {
  return path.join(base, DEFAULT_STORAGE_DIR);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
  return filePath;
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function listFiles(dir, ext = '') {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => !ext || f.endsWith(ext))
    .map(f => path.join(dir, f));
}

function moveFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.renameSync(src, dest);
  return dest;
}

function storageStat(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.statSync(filePath);
}

module.exports = {
  getStorageRoot,
  ensureDir,
  writeFile,
  readFile,
  deleteFile,
  listFiles,
  moveFile,
  storageStat,
};
