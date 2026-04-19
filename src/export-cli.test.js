import fs from 'fs';
import path from 'path';
import os from 'os';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-exportcli-'));
}

function writePng(dir, name) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, Buffer.from('PNG'));
  return p;
}

test('resolveExportPath returns zip filename', async () => {
  const { resolveExportPath } = await import('./export.js');
  const dir = makeTmpDir();
  const out = resolveExportPath(dir, 'staging');
  expect(out).toMatch(/staging/);
  expect(out).toMatch(/\.zip$/);
});

test('buildExportManifest with empty snapshots', async () => {
  const { buildExportManifest } = await import('./export.js');
  const m = buildExportManifest([]);
  expect(m.count).toBe(0);
  expect(Array.isArray(m.snapshots)).toBe(true);
});

test('writeManifest is idempotent', async () => {
  const { buildExportManifest, writeManifest } = await import('./export.js');
  const dir = makeTmpDir();
  const m = buildExportManifest(['a.png']);
  await writeManifest(dir, m);
  await writeManifest(dir, m);
  const files = fs.readdirSync(dir);
  expect(files.filter(f => f === 'manifest.json').length).toBe(1);
});
