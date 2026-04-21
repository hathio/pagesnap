import fs from 'fs';
import path from 'path';
import { getStorageRoot, ensureDir } from './storage.js';

const AUDIT_FILE = 'audit.log';

export function getAuditPath(root) {
  const base = root || getStorageRoot();
  return path.join(base, AUDIT_FILE);
}

export function buildAuditEntry(action, details = {}) {
  return {
    ts: new Date().toISOString(),
    action,
    ...details,
  };
}

export function writeAuditEntry(entry, root) {
  const filePath = getAuditPath(root);
  ensureDir(path.dirname(filePath));
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(filePath, line, 'utf8');
}

export function readAuditLog(root) {
  const filePath = getAuditPath(root);
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export function filterAuditLog(entries, { action, since, until } = {}) {
  return entries.filter((e) => {
    if (action && e.action !== action) return false;
    if (since && e.ts < since) return false;
    if (until && e.ts > until) return false;
    return true;
  });
}

export function clearAuditLog(root) {
  const filePath = getAuditPath(root);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}
