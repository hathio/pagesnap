import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { startReportServer, stopServer } from './server.js';

async function makeTmpDir() {
  return mkdtemp(path.join(tmpdir(), 'pagesnap-server-'));
}

describe('startReportServer', () => {
  let server;
  let dir;
  const port = 19823;

  before(async () => {
    dir = await makeTmpDir();
    await writeFile(path.join(dir, 'index.html'), '<h1>Report</h1>');
    await mkdir(path.join(dir, 'imgs'));
    await writeFile(path.join(dir, 'imgs', 'test.png'), Buffer.from([137, 80, 78, 71]));
    server = await startReportServer(dir, port);
  });

  after(async () => {
    await stopServer(server);
  });

  test('serves index.html at /', async () => {
    const res = await fetch(`http://localhost:${port}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('Report'));
  });

  test('serves nested files', async () => {
    const res = await fetch(`http://localhost:${port}/imgs/test.png`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/png');
  });

  test('returns 404 for missing files', async () => {
    const res = await fetch(`http://localhost:${port}/missing.html`);
    assert.equal(res.status, 404);
  });
});
