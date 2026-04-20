import fs from 'fs';
import path from 'path';
import { getStorageRoot } from './storage.js';

export function getMetadataPath(snapshotId) {
  return path.join(getStorageRoot(), 'metadata', `${snapshotId}.json`);
}

export function readMetadata(snapshotId) {
  const metaPath = getMetadataPath(snapshotId);
  if (!fs.existsSync(metaPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return null;
  }
}

export function writeMetadata(snapshotId, data) {
  const metaPath = getMetadataPath(snapshotId);
  fs.mkdirSync(path.dirname(metaPath), { recursive: true });
  const record = {
    snapshotId,
    createdAt: data.createdAt ?? new Date().toISOString(),
    url: data.url ?? null,
    label: data.label ?? null,
    tags: data.tags ?? [],
    diffScore: data.diffScore ?? null,
    ...data,
  };
  fs.writeFileSync(metaPath, JSON.stringify(record, null, 2));
  return record;
}

export function deleteMetadata(snapshotId) {
  const metaPath = getMetadataPath(snapshotId);
  if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);
}

export function listMetadata() {
  const dir = path.join(getStorageRoot(), 'metadata');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export function findMetadataByTag(tag) {
  return listMetadata().filter((m) => m.tags && m.tags.includes(tag));
}
