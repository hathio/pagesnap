import fs from 'fs';
import path from 'path';
import { getBaselinePath, hasBaseline, copyToBaseline } from './baseline.js';
import { readAuditLog } from './audit.js';
import { writeAuditEntry } from './audit.js';

export function listRollbackPoints(snapshotDir, name) {
  const auditLog = readAuditLog(snapshotDir);
  return auditLog
    .filter(e => e.action === 'promote' && e.name === name)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getRollbackPath(snapshotDir, name, timestamp) {
  return path.join(snapshotDir, '.rollback', name, `${timestamp}.png`);
}

export function saveRollbackPoint(snapshotDir, name) {
  const src = getBaselinePath(snapshotDir, name);
  if (!fs.existsSync(src)) return null;
  const timestamp = Date.now();
  const dest = getRollbackPath(snapshotDir, name, timestamp);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return timestamp;
}

export function rollbackBaseline(snapshotDir, name, timestamp) {
  const src = getRollbackPath(snapshotDir, name, timestamp);
  if (!fs.existsSync(src)) {
    throw new Error(`Rollback point not found: ${name}@${timestamp}`);
  }
  const dest = getBaselinePath(snapshotDir, name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  writeAuditEntry(snapshotDir, {
    action: 'rollback',
    name,
    timestamp: Date.now(),
    rolledBackTo: timestamp,
  });
  return dest;
}

export function pruneRollbackPoints(snapshotDir, name, keep = 5) {
  const points = listRollbackPoints(snapshotDir, name);
  const toDelete = points.slice(keep);
  for (const entry of toDelete) {
    const p = getRollbackPath(snapshotDir, name, entry.timestamp);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  return toDelete.length;
}
