import { describe, it, expect, beforeEach } from 'vitest';
import { compareSnapshot, compareAll, summarizeComparison } from './compare.js';
import { copyToBaseline } from './baseline.js';
import path from 'path';
import os from 'os';
import fs from 'fs';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-compare-'));
}

function writeSolidPNG(filePath, r, g, b) {
  // 1x1 PNG with given RGB
  const buf = Buffer.from([
    0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,
    0x00,0x00,0x00,0x0d,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,
    0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,
    0xde,0x00,0x00,0x00,0x0c,0x49,0x44,0x41,
    0x54,0x08,0xd7,0x63,r,g,b,0x00,0x00,
    0x00,0x04,0x00,0x01,0xe2,0x21,0xbc,0x33,
    0x00,0x00,0x00,0x00,0x49,0x45,0x4e,0x44,
    0xae,0x42,0x60,0x82,
  ]);
  fs.writeFileSync(filePath, buf);
}

describe('compareSnapshot', () => {
  it('returns no-baseline when baseline missing', async () => {
    const result = await compareSnapshot('nonexistent-page', '/tmp/fake.png');
    expect(result.status).toBe('no-baseline');
  });
});

describe('summarizeComparison', () => {
  it('counts results correctly', () => {
    const results = [
      { status: 'match', name: 'a' },
      { status: 'diff', name: 'b' },
      { status: 'no-baseline', name: 'c' },
      { status: 'match', name: 'd' },
    ];
    const summary = summarizeComparison(results);
    expect(summary.total).toBe(4);
    expect(summary.matched).toBe(2);
    expect(summary.diffed).toBe(1);
    expect(summary.missing).toBe(1);
  });

  it('handles empty results', () => {
    const summary = summarizeComparison([]);
    expect(summary.total).toBe(0);
    expect(summary.matched).toBe(0);
  });
});
