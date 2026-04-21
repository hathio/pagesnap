import fs from 'fs';
import path from 'path';
import { getStorageRoot, ensureDir } from './storage.js';

const TAGS_FILE = 'tags.json';

export function getTagsPath(snapshotDir) {
  return path.join(snapshotDir || getStorageRoot(), TAGS_FILE);
}

export function readTags(snapshotDir) {
  const tagsPath = getTagsPath(snapshotDir);
  if (!fs.existsSync(tagsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
  } catch {
    return {};
  }
}

export function writeTags(tags, snapshotDir) {
  const tagsPath = getTagsPath(snapshotDir);
  ensureDir(path.dirname(tagsPath));
  fs.writeFileSync(tagsPath, JSON.stringify(tags, null, 2));
}

export function addTag(snapshotId, tag, snapshotDir) {
  const tags = readTags(snapshotDir);
  if (!tags[snapshotId]) tags[snapshotId] = [];
  if (!tags[snapshotId].includes(tag)) {
    tags[snapshotId].push(tag);
  }
  writeTags(tags, snapshotDir);
  return tags[snapshotId];
}

export function removeTag(snapshotId, tag, snapshotDir) {
  const tags = readTags(snapshotDir);
  if (!tags[snapshotId]) return [];
  tags[snapshotId] = tags[snapshotId].filter(t => t !== tag);
  if (tags[snapshotId].length === 0) delete tags[snapshotId];
  writeTags(tags, snapshotDir);
  return tags[snapshotId] || [];
}

export function getTagsForSnapshot(snapshotId, snapshotDir) {
  const tags = readTags(snapshotDir);
  return tags[snapshotId] || [];
}

export function getSnapshotsByTag(tag, snapshotDir) {
  const tags = readTags(snapshotDir);
  return Object.entries(tags)
    .filter(([, t]) => t.includes(tag))
    .map(([id]) => id);
}

export function listAllTags(snapshotDir) {
  const tags = readTags(snapshotDir);
  const all = new Set();
  for (const tagList of Object.values(tags)) {
    for (const t of tagList) all.add(t);
  }
  return [...all].sort();
}
