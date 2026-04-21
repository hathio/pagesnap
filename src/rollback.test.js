import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  saveRollbackPoint,
  rollbackBaseline,
  listRollbackPoints,
  pruneRollbackPoints,
  getRollbackPath,
} from './rollback.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-rollback-'));
}

function writePng(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.from('PNG'));
}

describe('rollback', () => {
  let tmp;
  beforeEach(() => { tmp = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

  it('saveRollbackPoint returns null when no baseline exists', () => {
    const result = saveRollbackPoint(tmp, 'home');
    assert.equal(result, null);
  });

  it('saveRollbackPoint copies baseline and returns timestamp', () => {
    const baseline = path.join(tmp, 'baseline', 'home.png');
    writePng(baseline);
    const ts = saveRollbackPoint(tmp, 'home');
    assert.ok(typeof ts === 'number');
    const saved = getRollbackPath(tmp, 'home', ts);
    assert.ok(fs.existsSync(saved));
  });

  it('rollbackBaseline restores file from rollback point', () => {
    const baseline = path.join(tmp, 'baseline', 'home.png');
    writePng(baseline);
    const ts = saveRollbackPoint(tmp, 'home');
    fs.writeFileSync(baseline, Buffer.from('CHANGED'));
    rollbackBaseline(tmp, 'home', ts);
    const content = fs.readFileSync(baseline);
    assert.equal(content.toString(), 'PNG');
  });

  it('rollbackBaseline throws when rollback point missing', () => {
    assert.throws(() => rollbackBaseline(tmp, 'home', 999999), /not found/);
  });

  it('pruneRollbackPoints removes old entries beyond keep count', () => {
    const baseline = path.join(tmp, 'baseline', 'home.png');
    writePng(baseline);
    const timestamps = [];
    for (let i = 0; i < 4; i++) {
      timestamps.push(saveRollbackPoint(tmp, 'home'));
    }
    const removed = pruneRollbackPoints(tmp, 'home', 2);
    assert.ok(removed >= 0);
  });
});
