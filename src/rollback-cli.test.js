import fs from 'fs';
import path from 'path';
import os from 'os';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { runRollbackCli } from './rollback-cli.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-rollback-cli-'));
}

function writePng(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, Buffer.from('PNG'));
}

async function run(argv, tmp) {
  process.env.PAGESNAP_SNAPSHOT_DIR = tmp;
  const lines = [];
  const orig = console.log;
  console.log = (...a) => lines.push(a.join(' '));
  try {
    await runRollbackCli(argv);
  } finally {
    console.log = orig;
    delete process.env.PAGESNAP_SNAPSHOT_DIR;
  }
  return lines;
}

describe('rollback-cli', () => {
  let tmp;
  beforeEach(() => { tmp = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

  it('prints usage with no args', async () => {
    const out = await run([], tmp);
    assert.ok(out.some(l => l.includes('Usage')));
  });

  it('list shows no rollback points message', async () => {
    const out = await run(['list', 'home'], tmp);
    assert.ok(out.some(l => l.includes('No rollback')));
  });

  it('save reports no baseline found', async () => {
    const out = await run(['save', 'home'], tmp);
    assert.ok(out.some(l => l.includes('No baseline')));
  });

  it('save then list shows rollback point', async () => {
    const baseline = path.join(tmp, 'baseline', 'home.png');
    writePng(baseline);
    await run(['save', 'home'], tmp);
    const out = await run(['list', 'home'], tmp);
    assert.ok(out.length > 0);
  });

  it('prune with no points returns 0 removed', async () => {
    const out = await run(['prune', 'home'], tmp);
    assert.ok(out.some(l => l.includes('0 rollback')));
  });
});
