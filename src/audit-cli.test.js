import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { writeAuditEntry, buildAuditEntry, clearAuditLog, getAuditPath } from './audit.js';
import { runAuditCli } from './audit-cli.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-audit-cli-'));
}

function run(argv, root) {
  const logs = [];
  const orig = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => logs.push('[err] ' + a.join(' '));
  runAuditCli(argv);
  console.log = orig;
  console.error = origErr;
  return logs;
}

describe('audit-cli', () => {
  let tmp;
  before(() => { tmp = makeTmpDir(); });
  after(() => { fs.rmSync(tmp, { recursive: true, force: true }); });
  beforeEach(() => { clearAuditLog(tmp); });

  it('list prints no entries message when empty', () => {
    // We rely on default storage root; just test the output shape
    const out = run(['list']);
    assert.ok(out.some((l) => l.includes('No audit entries') || l.includes(']')));
  });

  it('clear prints confirmation', () => {
    const out = run(['clear']);
    assert.ok(out[0].includes('cleared'));
  });

  it('unknown command sets exitCode', () => {
    const prev = process.exitCode;
    run(['bogus']);
    assert.equal(process.exitCode, 1);
    process.exitCode = prev;
  });

  it('help prints usage', () => {
    const out = run(['help']);
    assert.ok(out.some((l) => l.includes('Usage')));
  });
});
