const fs = require('fs');
const path = require('path');
const os = require('os');
const { PNG } = require('pngjs');
const { diffSnapshots } = require('./diff');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-diff-'));
}

function writeSolidPNG(filePath, width, height, r, g, b) {
  const png = new PNG({ width, height });
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4 + 0] = r;
    png.data[i * 4 + 1] = g;
    png.data[i * 4 + 2] = b;
    png.data[i * 4 + 3] = 255;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
}

describe('diffSnapshots', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = makeTmpDir(); });
  afterEach(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

  test('returns no-baseline when baseline missing', async () => {
    const current = path.join(tmpDir, 'current.png');
    writeSolidPNG(current, 10, 10, 255, 0, 0);
    const result = await diffSnapshots(path.join(tmpDir, 'baseline.png'), current, null);
    expect(result.status).toBe('no-baseline');
  });

  test('returns match for identical images', async () => {
    const baseline = path.join(tmpDir, 'baseline.png');
    const current = path.join(tmpDir, 'current.png');
    writeSolidPNG(baseline, 10, 10, 0, 255, 0);
    writeSolidPNG(current, 10, 10, 0, 255, 0);
    const result = await diffSnapshots(baseline, current, null);
    expect(result.status).toBe('match');
    expect(result.numDiffPixels).toBe(0);
  });

  test('returns diff for different images and writes diff file', async () => {
    const baseline = path.join(tmpDir, 'baseline.png');
    const current = path.join(tmpDir, 'current.png');
    const diffOut = path.join(tmpDir, 'diffs', 'diff.png');
    writeSolidPNG(baseline, 10, 10, 255, 0, 0);
    writeSolidPNG(current, 10, 10, 0, 0, 255);
    const result = await diffSnapshots(baseline, current, diffOut);
    expect(result.status).toBe('diff');
    expect(result.numDiffPixels).toBeGreaterThan(0);
    expect(fs.existsSync(diffOut)).toBe(true);
  });

  test('returns size-mismatch for different dimensions', async () => {
    const baseline = path.join(tmpDir, 'baseline.png');
    const current = path.join(tmpDir, 'current.png');
    writeSolidPNG(baseline, 10, 10, 0, 0, 0);
    writeSolidPNG(current, 20, 20, 0, 0, 0);
    const result = await diffSnapshots(baseline, current, null);
    expect(result.status).toBe('size-mismatch');
  });
});
