import fs from 'fs';
import path from 'path';
import os from 'os';
import { buildExportManifest, writeManifest, resolveExportPath } from './export.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-export-'));
}

test('buildExportManifest includes count and version', () => {
  const snaps = ['a.png', 'b.png'];
  const manifest = buildExportManifest(snaps, { label: 'test' });
  expect(manifest.version).toBe(1);
  expect(manifest.count).toBe(2);
  expect(manifest.label).toBe('test');
  expect(manifest.exportedAt).toBeTruthy();
});

test('writeManifest writes JSON file', async () => {
  const dir = makeTmpDir();
  const manifest = buildExportManifest(['x.png']);
  const p = await writeManifest(dir, manifest);
  const content = JSON.parse(fs.readFileSync(p, 'utf8'));
  expect(content.version).toBe(1);
  expect(content.count).toBe(1);
});

test('resolveExportPath uses label slug', () => {
  const p = resolveExportPath('/out', 'My Label!');
  expect(p).toContain('my-label-');
  expect(p).toEndWith('.zip');
});

test('resolveExportPath defaults to export when no label', () => {
  const p = resolveExportPath('/out');
  expect(p).toContain('pagesnap-export-');
});
