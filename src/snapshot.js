const path = require('path');
const fs = require('fs');

const SNAPSHOTS_DIR = '.pagesnap';

/**
 * Return the absolute path to the snapshots root directory,
 * optionally relative to a given base (defaults to cwd).
 */
function getSnapshotDir(base = process.cwd()) {
  return path.resolve(base, SNAPSHOTS_DIR);
}

/**
 * Ensure snapshot directory structure exists.
 * Creates <snapshotDir>/baseline and <snapshotDir>/current.
 */
function ensureSnapshotDirs(snapshotDir) {
  for (const label of ['baseline', 'current']) {
    const dir = path.join(snapshotDir, label);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * List all snapshot PNG files under a given label.
 * @param {string} snapshotDir
 * @param {string} label  'baseline' | 'current'
 * @returns {string[]} absolute file paths
 */
function listSnapshots(snapshotDir, label) {
  const dir = path.join(snapshotDir, label);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.png'))
    .map((f) => path.join(dir, f));
}

/**
 * Promote current snapshots to baseline by moving files.
 */
function promoteToBaseline(snapshotDir) {
  const currentFiles = listSnapshots(snapshotDir, 'current');
  if (currentFiles.length === 0) {
    throw new Error('No current snapshots to promote.');
  }
  const baselineDir = path.join(snapshotDir, 'baseline');
  for (const file of currentFiles) {
    const dest = path.join(baselineDir, path.basename(file));
    fs.copyFileSync(file, dest);
    fs.unlinkSync(file);
  }
  return currentFiles.length;
}

module.exports = { getSnapshotDir, ensureSnapshotDirs, listSnapshots, promoteToBaseline, SNAPSHOTS_DIR };
