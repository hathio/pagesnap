import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addTag, removeTag, getTagsForSnapshot,
  getSnapshotsByTag, listAllTags, readTags
} from './tag.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-tag-'));
}

describe('tag', () => {
  let dir;
  beforeEach(() => { dir = makeTmpDir(); });

  it('adds a tag to a snapshot', () => {
    const result = addTag('snap-1', 'stable', dir);
    expect(result).toContain('stable');
  });

  it('does not duplicate tags', () => {
    addTag('snap-1', 'stable', dir);
    const result = addTag('snap-1', 'stable', dir);
    expect(result.filter(t => t === 'stable').length).toBe(1);
  });

  it('removes a tag from a snapshot', () => {
    addTag('snap-1', 'stable', dir);
    addTag('snap-1', 'beta', dir);
    removeTag('snap-1', 'stable', dir);
    expect(getTagsForSnapshot('snap-1', dir)).toEqual(['beta']);
  });

  it('returns empty array for unknown snapshot', () => {
    expect(getTagsForSnapshot('no-such', dir)).toEqual([]);
  });

  it('cleans up empty tag arrays on remove', () => {
    addTag('snap-1', 'only', dir);
    removeTag('snap-1', 'only', dir);
    const tags = readTags(dir);
    expect(tags['snap-1']).toBeUndefined();
  });

  it('finds snapshots by tag', () => {
    addTag('snap-1', 'release', dir);
    addTag('snap-2', 'release', dir);
    addTag('snap-3', 'beta', dir);
    expect(getSnapshotsByTag('release', dir)).toEqual(['snap-1', 'snap-2']);
  });

  it('lists all unique tags', () => {
    addTag('snap-1', 'stable', dir);
    addTag('snap-2', 'beta', dir);
    addTag('snap-3', 'stable', dir);
    expect(listAllTags(dir)).toEqual(['beta', 'stable']);
  });
});
