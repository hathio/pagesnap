const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { ensureSnapshotDirs } = require('./snapshot');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-bclicli-'));
}

function writePng(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.from('PNG'));
}

function run(args, cwd) {
  return execSync(`node ${path.resolve(__dirname, 'baseline-cli.js')} ${args}`, {
    cwd, encoding: 'utf8', env: { ...process.env, PAGESNAP_SNAPSHOTS_DIR: path.join(cwd, 'snapshots') }
  });
}

test('list shows no baselines', () => {
  const dir = makeTmpDir();
  ensureSnapshotDirs(path.join(dir, 'snapshots'));
  const out = run('list', dir);
  expect(out).toContain('No baselines');
});

test('promote and list baseline', () => {
  const dir = makeTmpDir();
  const snaps = path.join(dir, 'snapshots');
  ensureSnapshotDirs(snaps);
  writePng(path.join(snaps, 'current', 'home.png'));
  run('promote home', dir);
  const out = run('list', dir);
  expect(out).toContain('home');
});

test('delete baseline', () => {
  const dir = makeTmpDir();
  const snaps = path.join(dir, 'snapshots');
  ensureSnapshotDirs(snaps);
  writePng(path.join(snaps, 'current', 'home.png'));
  run('promote home', dir);
  run('delete home', dir);
  const out = run('list', dir);
  expect(out).toContain('No baselines');
});
