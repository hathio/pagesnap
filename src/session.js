import { randomBytes } from 'crypto';
import { join } from 'path';
import { getStorageRoot, ensureDir, writeFile, readFile, deleteFile } from './storage.js';

export function getSessionDir() {
  return join(getStorageRoot(), 'sessions');
}

export function generateSessionId() {
  return randomBytes(12).toString('hex');
}

export function getSessionPath(sessionId) {
  return join(getSessionDir(), `${sessionId}.json`);
}

export async function createSession(meta = {}) {
  const id = generateSessionId();
  const session = {
    id,
    createdAt: new Date().toISOString(),
    status: 'active',
    ...meta,
  };
  await ensureDir(getSessionDir());
  await writeFile(getSessionPath(id), JSON.stringify(session, null, 2));
  return session;
}

export async function readSession(sessionId) {
  const raw = await readFile(getSessionPath(sessionId));
  if (!raw) return null;
  return JSON.parse(raw);
}

export async function updateSession(sessionId, patch) {
  const session = await readSession(sessionId);
  if (!session) throw new Error(`Session not found: ${sessionId}`);
  const updated = { ...session, ...patch, updatedAt: new Date().toISOString() };
  await writeFile(getSessionPath(sessionId), JSON.stringify(updated, null, 2));
  return updated;
}

export async function closeSession(sessionId) {
  return updateSession(sessionId, { status: 'closed' });
}

export async function deleteSession(sessionId) {
  await deleteFile(getSessionPath(sessionId));
}

export async function listSessions() {
  const { readdir } = await import('fs/promises');
  await ensureDir(getSessionDir());
  const files = await readdir(getSessionDir());
  const sessions = [];
  for (const f of files.filter(f => f.endsWith('.json'))) {
    const raw = await readFile(join(getSessionDir(), f));
    if (raw) sessions.push(JSON.parse(raw));
  }
  return sessions.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
