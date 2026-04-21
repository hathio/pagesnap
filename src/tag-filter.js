import { getTagsForSnapshot, getSnapshotsByTag } from './tag.js';

/**
 * Filter a list of snapshot IDs to only those matching given tags.
 * @param {string[]} snapshotIds
 * @param {string[]} tags - required tags (AND logic)
 * @param {string} snapshotDir
 * @returns {string[]}
 */
export function filterByTags(snapshotIds, tags, snapshotDir) {
  if (!tags || tags.length === 0) return snapshotIds;
  return snapshotIds.filter(id => {
    const snapshotTags = getTagsForSnapshot(id, snapshotDir);
    return tags.every(t => snapshotTags.includes(t));
  });
}

/**
 * Filter a list of snapshot IDs to those matching ANY of the given tags.
 * @param {string[]} snapshotIds
 * @param {string[]} tags
 * @param {string} snapshotDir
 * @returns {string[]}
 */
export function filterByAnyTag(snapshotIds, tags, snapshotDir) {
  if (!tags || tags.length === 0) return snapshotIds;
  const taggedSet = new Set(
    tags.flatMap(t => getSnapshotsByTag(t, snapshotDir))
  );
  return snapshotIds.filter(id => taggedSet.has(id));
}

/**
 * Parse --tag flags from CLI argv array.
 * Supports: --tag foo --tag bar  or  --tag foo,bar
 * @param {string[]} argv
 * @returns {string[]}
 */
export function parseTagArgs(argv) {
  const tags = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tag' && argv[i + 1]) {
      tags.push(...argv[i + 1].split(',').map(t => t.trim()).filter(Boolean));
      i++;
    }
  }
  return tags;
}
