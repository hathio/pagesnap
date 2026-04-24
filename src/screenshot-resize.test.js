import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import sharp from 'sharp';
import {
  parseResizeOptions,
  resizeImage,
  describeResize,
  buildResizeSuffix,
} from './screenshot-resize.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-resize-'));
}

async function writeSolidPNG(filePath, width = 100, height = 100) {
  await sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 100, b: 50 } },
  })
    .png()
    .toFile(filePath);
}

describe('parseResizeOptions', () => {
  it('parses width and height', () => {
    const opts = parseResizeOptions({ width: '800', height: '600' });
    expect(opts.width).toBe(800);
    expect(opts.height).toBe(600);
    expect(opts.mode).toBe('cover');
  });

  it('allows only width', () => {
    const opts = parseResizeOptions({ width: '400' });
    expect(opts.width).toBe(400);
    expect(opts.height).toBeUndefined();
  });

  it('throws on invalid width', () => {
    expect(() => parseResizeOptions({ width: 'abc' })).toThrow('Invalid resize width');
  });

  it('throws on missing dimensions', () => {
    expect(() => parseResizeOptions({})).toThrow('At least one');
  });

  it('throws on unknown mode', () => {
    expect(() => parseResizeOptions({ width: '100', mode: 'stretch' })).toThrow('Unknown resize mode');
  });
});

describe('resizeImage', () => {
  let tmpDir;
  beforeAll(() => { tmpDir = makeTmpDir(); });
  afterAll(() => { fs.rmSync(tmpDir, { recursive: true }); });

  it('resizes an image to the target dimensions', async () => {
    const src = path.join(tmpDir, 'input.png');
    const out = path.join(tmpDir, 'output.png');
    await writeSolidPNG(src, 200, 200);
    const opts = parseResizeOptions({ width: '80', height: '60', mode: 'fill' });
    await resizeImage(src, out, opts);
    const meta = await sharp(out).metadata();
    expect(meta.width).toBe(80);
    expect(meta.height).toBe(60);
  });
});

describe('describeResize', () => {
  it('returns a human-readable string', () => {
    const s = describeResize({ width: 800, height: 600, mode: 'cover' });
    expect(s).toBe('resize(w:800 h:600, mode=cover)');
  });
});

describe('buildResizeSuffix', () => {
  it('builds a filename suffix', () => {
    expect(buildResizeSuffix({ width: 800, height: 600, mode: 'contain' })).toBe('w800-h600-contain');
  });

  it('omits missing dimension', () => {
    expect(buildResizeSuffix({ width: 400, mode: 'inside' })).toBe('w400-inside');
  });
});
