import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createSession, readSession, updateSession, closeSession, deleteSession, listSessions } from './session.js';

function makeTmpDir() {
  return mkdtemp(join(tmpdir(), 'pagesnap-session-'));
}

let tmpDir;
let origEnv;

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

test('createSession returns session with id and status', async () => {
  const s = await createSession({ label: 'test-run' });
  assert.ok(s.id);
  assert.equal(s.status, 'active');
  assert.equal(s.label, 'test-run');
  assert.ok(s.createdAt);
});

test('readSession returns persisted session', async () => {
  const s = await createSession();
  const loaded = await readSession(s.id);
  assert.equal(loaded.id, s.id);
});

test('readSession returns null for missing session', async () => {
  const result = await readSession('nonexistent-id');
  assert.equal(result, null);
});

test('updateSession patches fields', async () => {
  const s = await createSession();
  const updated = await updateSession(s.id, { status: 'running', pages: 5 });
  assert.equal(updated.status, 'running');
  assert.equal(updated.pages, 5);
  assert.ok(updated.updatedAt);
});

test('closeSession sets status to closed', async () => {
  const s = await createSession();
  const closed = await closeSession(s.id);
  assert.equal(closed.status, 'closed');
});

test('deleteSession removes session file', async () => {
  const s = await createSession();
  await deleteSession(s.id);
  const result = await readSession(s.id);
  assert.equal(result, null);
});

test('listSessions returns all sessions sorted by createdAt', async () => {
  const a = await createSession({ label: 'a' });
  const b = await createSession({ label: 'b' });
  const all = await listSessions();
  const ids = all.map(s => s.id);
  assert.ok(ids.includes(a.id));
  assert.ok(ids.includes(b.id));
});
