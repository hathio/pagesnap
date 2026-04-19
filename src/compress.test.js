import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { compressFile, decompressFile, compressDir, isCompressed, getCompressedPath } from './compress.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-compress-'));
}

describe('compress', () => {
  let tmp;
  before(() => { tmp = makeTmpDir(); });
  after(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

  it('getCompressedPath appends .gz', () => {
    assert.equal(getCompressedPath('/a/b/file.png'), '/a/b/file.png.gz');
  });

  it('isCompressed detects .gz files', () => {
    assert.ok(isCompressed('shot.png.gz'));
    assert.ok(!isCompressed('shot.png'));
  });

  it('compressFile creates a .gz file', async () => {
    const src = path.join(tmp, 'test.txt');
    fs.writeFileSync(src, 'hello pagesnap');
    const out = await compressFile(src);
    assert.ok(fs.existsSync(out));
    assert.ok(out.endsWith('.gz'));
    assert.ok(fs.statSync(out).size > 0);
  });

  it('decompressFile restores original content', async () => {
    const src = path.join(tmp, 'round.txt');
    fs.writeFileSync(src, 'round trip content');
    const compressed = await compressFile(src);
    const restored = path.join(tmp, 'round_out.txt');
    await decompressFile(compressed, restored);
    assert.equal(fs.readFileSync(restored, 'utf8'), 'round trip content');
  });

  it('compressDir compresses all pngs', async () => {
    const dir = path.join(tmp, 'shots');
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'a.png'), 'fakepng1');
    fs.writeFileSync(path.join(dir, 'b.png'), 'fakepng2');
    const results = await compressDir(dir);
    assert.equal(results.length, 2);
    for (const r of results) assert.ok(r.endsWith('.gz'));
  });

  it('compressDir returns empty for missing dir', async () => {
    const results = await compressDir(path.join(tmp, 'nope'));
    assert.deepEqual(results, []);
  });
});
