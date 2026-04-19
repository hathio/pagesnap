const fs = require('fs');
const path = require('path');
const { getSnapshotDir } = require('./snapshot');

function getBaselinePath(name, snapshotsDir) {
  return path.join(getSnapshotDir('baseline', snapshotsDir), `${name}.png`);
}

function hasBaseline(name, snapshotsDir) {
  return fs.existsSync(getBaselinePath(name, snapshotsDir));
}

function copyToBaseline(name, snapshotsDir) {
  const src = path.join(getSnapshotDir('current', snapshotsDir), `${name}.png`);
  const dest = getBaselinePath(name, snapshotsDir);
  if (!fs.existsSync(src)) throw new Error(`Current snapshot not found: ${src}`);
  fs.copyFileSync(src, dest);
  return dest;
}

function deleteBaseline(name, snapshotsDir) {
  const p = getBaselinePath(name, snapshotsDir);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

function listBaselines(snapshotsDir) {
  const dir = getSnapshotDir('baseline', snapshotsDir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace(/\.png$/, ''));
}

module.exports = { getBaselinePath, hasBaseline, copyToBaseline, deleteBaseline, listBaselines };
