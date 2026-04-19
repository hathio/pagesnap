import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  getSnapshotDir,
  ensureSnapshotDirs,
  listSnapshots,
  promoteToBaseline,
} from './snapshot.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-snap-'));
}

describe('getSnapshotDir', () => {
  test('returns path under base dir', () => {
    const dir = getSnapshotDir('/base', 'current');
    expect(dir).toBe('/base/current');
  });
});

describe('ensureSnapshotDirs', () => {
  test('creates baseline and current dirs', () => {
    const base = makeTmpDir();
    ensureSnapshotDirs(base);
    expect(fs.existsSync(path.join(base, 'baseline'))).toBe(true);
    expect(fs.existsSync(path.join(base, 'current'))).toBe(true);
  });
});

describe('listSnapshots', () => {
  test('returns empty array when dir is empty', () => {
    const base = makeTmpDir();
    ensureSnapshotDirs(base);
    expect(listSnapshots(path.join(base, 'current'))).toEqual([]);
  });

  test('lists png files', () => {
    const base = makeTmpDir();
    ensureSnapshotDirs(base);
    const cur = path.join(base, 'current');
    fs.writeFileSync(path.join(cur, 'index.png'), '');
    fs.writeFileSync(path.join(cur, 'about.png'), '');
    const snaps = listSnapshots(cur);
    expect(snaps).toHaveLength(2);
    expect(snaps).toContain('index.png');
  });
});

describe('promoteToBaseline', () => {
  test('copies current pngs to baseline', () => {
    const base = makeTmpDir();
    ensureSnapshotDirs(base);
    const cur = path.join(base, 'current');
    const bl = path.join(base, 'baseline');
    fs.writeFileSync(path.join(cur, 'home.png'), 'data');
    promoteToBaseline(base);
    expect(fs.existsSync(path.join(bl, 'home.png'))).toBe(true);
  });
});
