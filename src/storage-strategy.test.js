import { describe, it, expect } from 'vitest';
import {
  parseStorageStrategy,
  resolveStoragePath,
  describeStorageStrategy,
} from './storage-strategy.js';
import path from 'path';

describe('parseStorageStrategy', () => {
  it('returns flat strategy for "flat"', () => {
    const s = parseStorageStrategy('flat');
    expect(s.type).toBe('flat');
  });

  it('returns dated strategy for "dated"', () => {
    const s = parseStorageStrategy('dated');
    expect(s.type).toBe('dated');
  });

  it('returns hashed strategy for "hashed"', () => {
    const s = parseStorageStrategy('hashed');
    expect(s.type).toBe('hashed');
  });

  it('defaults to flat for unknown input', () => {
    const s = parseStorageStrategy('unknown');
    expect(s.type).toBe('flat');
  });

  it('defaults to flat when called with no argument', () => {
    const s = parseStorageStrategy();
    expect(s.type).toBe('flat');
  });
});

describe('resolveStoragePath', () => {
  const base = '/snapshots';
  const name = 'home.png';

  it('flat strategy returns base/name', () => {
    const strategy = parseStorageStrategy('flat');
    const result = resolveStoragePath(strategy, base, name);
    expect(result).toBe(path.join(base, name));
  });

  it('dated strategy includes a date segment', () => {
    const strategy = parseStorageStrategy('dated');
    const result = resolveStoragePath(strategy, base, name);
    // Should contain a YYYY-MM-DD segment
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(result).toContain(name);
  });

  it('hashed strategy includes a hash segment', () => {
    const strategy = parseStorageStrategy('hashed');
    const result = resolveStoragePath(strategy, base, name);
    // Should contain a short hex hash directory
    expect(result).toMatch(/[a-f0-9]{6,}/);
    expect(result).toContain(name);
  });

  it('two different names produce different hashed paths', () => {
    const strategy = parseStorageStrategy('hashed');
    const a = resolveStoragePath(strategy, base, 'a.png');
    const b = resolveStoragePath(strategy, base, 'b.png');
    expect(a).not.toBe(b);
  });
});

describe('describeStorageStrategy', () => {
  it('returns a non-empty string for each strategy', () => {
    for (const type of ['flat', 'dated', 'hashed']) {
      const strategy = parseStorageStrategy(type);
      const desc = describeStorageStrategy(strategy);
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    }
  });

  it('includes the strategy type in the description', () => {
    const strategy = parseStorageStrategy('dated');
    const desc = describeStorageStrategy(strategy);
    expect(desc.toLowerCase()).toContain('dated');
  });
});
