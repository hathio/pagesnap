import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-meta-'));
}

let tmpDir;
let origEnv;

beforeEach(() => {
  tmpDir = makeTmpDir();
  origEnv = process.env.PAGESNAP_STORAGE_ROOT;
  process.env.PAGESNAP_STORAGE_ROOT = tmpDir;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  if (origEnv === undefined) delete process.env.PAGESNAP_STORAGE_ROOT;
  else process.env.PAGESNAP_STORAGE_ROOT = origEnv;
});

describe('metadata', async () => {
  const { readMetadata, writeMetadata, deleteMetadata, listMetadata, findMetadataByTag } =
    await import('./metadata.js');

  it('returns null for missing metadata', () => {
    assert.equal(readMetadata('nonexistent'), null);
  });

  it('writes and reads metadata', () => {
    const record = writeMetadata('snap-001', { url: 'https://example.com', tags: ['prod'] });
    assert.equal(record.snapshotId, 'snap-001');
    assert.equal(record.url, 'https://example.com');
    const read = readMetadata('snap-001');
    assert.equal(read.url, 'https://example.com');
  });

  it('deletes metadata', () => {
    writeMetadata('snap-002', { url: 'https://a.com' });
    deleteMetadata('snap-002');
    assert.equal(readMetadata('snap-002'), null);
  });

  it('lists all metadata', () => {
    writeMetadata('snap-003', { url: 'https://b.com' });
    writeMetadata('snap-004', { url: 'https://c.com' });
    const all = listMetadata();
    assert.ok(all.length >= 2);
  });

  it('finds metadata by tag', () => {
    writeMetadata('snap-005', { url: 'https://d.com', tags: ['staging'] });
    writeMetadata('snap-006', { url: 'https://e.com', tags: ['prod'] });
    const results = findMetadataByTag('staging');
    assert.ok(results.some((m) => m.snapshotId === 'snap-005'));
    assert.ok(!results.some((m) => m.snapshotId === 'snap-006'));
  });
});
