import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  getAuditPath,
  buildAuditEntry,
  writeAuditEntry,
  readAuditLog,
  filterAuditLog,
  clearAuditLog,
} from './audit.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-audit-'));
}

describe('audit', () => {
  let tmp;
  before(() => { tmp = makeTmpDir(); });
  after(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

  it('getAuditPath returns path under root', () => {
    const p = getAuditPath(tmp);
    assert.ok(p.startsWith(tmp));
    assert.ok(p.endsWith('audit.log'));
  });

  it('buildAuditEntry includes action and ts', () => {
    const e = buildAuditEntry('capture', { url: 'http://example.com' });
    assert.equal(e.action, 'capture');
    assert.ok(e.ts);
    assert.equal(e.url, 'http://example.com');
  });

  it('writeAuditEntry and readAuditLog round-trip', () => {
    const e = buildAuditEntry('diff', { page: 'home' });
    writeAuditEntry(e, tmp);
    const log = readAuditLog(tmp);
    assert.equal(log.length, 1);
    assert.equal(log[0].action, 'diff');
    assert.equal(log[0].page, 'home');
  });

  it('readAuditLog returns empty array when file missing', () => {
    const other = makeTmpDir();
    const log = readAuditLog(other);
    assert.deepEqual(log, []);
    fs.rmSync(other, { recursive: true, force: true });
  });

  it('filterAuditLog filters by action', () => {
    clearAuditLog(tmp);
    writeAuditEntry(buildAuditEntry('capture'), tmp);
    writeAuditEntry(buildAuditEntry('diff'), tmp);
    const log = readAuditLog(tmp);
    const filtered = filterAuditLog(log, { action: 'capture' });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].action, 'capture');
  });

  it('clearAuditLog removes the file', () => {
    writeAuditEntry(buildAuditEntry('test'), tmp);
    clearAuditLog(tmp);
    assert.equal(readAuditLog(tmp).length, 0);
  });
});
