import { readFile } from './storage.js';
import { getBaselinePath, hasBaseline } from './baseline.js';
import { diff } from './diff.js';
import { getMetadataPath, readMetadata } from './metadata.js';
import path from 'path';

export async function compareSnapshot(name, currentPath, opts = {}) {
  if (!hasBaseline(name)) {
    return { status: 'no-baseline', name };
  }

  const baselinePath = getBaselinePath(name);

  const result = await diff(baselinePath, currentPath, opts);

  return {
    status: result.match ? 'match' : 'diff',
    name,
    diffPixels: result.diffPixels,
    diffPercent: result.diffPercent,
    diffImagePath: result.diffImagePath ?? null,
  };
}

export async function compareAll(names, snapshotDir, opts = {}) {
  const results = [];
  for (const name of names) {
    const currentPath = path.join(snapshotDir, `${name}.png`);
    const result = await compareSnapshot(name, currentPath, opts);
    results.push(result);
  }
  return results;
}

export function summarizeComparison(results) {
  const total = results.length;
  const matched = results.filter(r => r.status === 'match').length;
  const diffed = results.filter(r => r.status === 'diff').length;
  const missing = results.filter(r => r.status === 'no-baseline').length;
  return { total, matched, diffed, missing };
}
