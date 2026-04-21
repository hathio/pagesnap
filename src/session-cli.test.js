import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { runSessionCli } from './session-cli.js';
import { createSession } from './session.js';

function makeTmpDir() {
  return mkdtemp(join(tmpdir(), 'pagesnap-session-cli-'));
}

let tmpDir;
let origEnv;
let output;

function run(argv) {
  const logs = [];
  const orig = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => logs.push(a.join(' '));
  return runSessionCli(argv).then(() => {
    console.log = orig;
    console.error = origErr;
    return logs.join('\n');
  });
}

before(async () => {
  tmpDir = await makeTmpDir();
  origEnv = process.env.PAGESNAP_ROOT;
  process.env.PAGESNAP_ROOT = tmpDir;
});

after(async () => {
  if (origEnv === undefined) delete process.env.PAGESNAP_ROOT;
  else process.env.PAGESNAP_ROOT = origEnv;
  await rm(tmpDir, { recursive: true, force: true });
});

test('session create outputs session id', async () => {
  const out = await run(['create', '--label', 'ci-run']);
  assert.match(out, /Session created:/);
  assert.match(out, /label:\s+ci-run/);
});

test('session list shows created sessions', async () => {
  await run(['create', '--label', 'list-test']);
  const out = await run(['list']);
  assert.match(out, /list-test/);
});

test('session show displays details', async () => {
  const s = await createSession({ label: 'show-test' });
  const out = await run(['show', s.id]);
  assert.match(out, /show-test/);
  assert.match(out, /active/);
});

test('session close marks as closed', async () => {
  const s = await createSession();
  const out = await run(['close', s.id]);
  assert.match(out, /Session closed/);
});

test('session delete removes session', async () => {
  const s = await createSession();
  const out = await run(['delete', s.id]);
  assert.match(out, /Session deleted/);
});

test('unknown command sets exitCode', async () => {
  const prev = process.exitCode;
  process.exitCode = 0;
  await run(['bogus']);
  assert.equal(process.exitCode, 1);
  process.exitCode = prev;
});
