const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const path = require('path');

async function loadPNG(filePath) {
  return new Promise((resolve, reject) => {
    const img = fs.createReadStream(filePath).pipe(new PNG());
    img.on('parsed', function () { resolve(this); });
    img.on('error', reject);
  });
}

async function diffSnapshots(baselinePath, currentPath, diffOutputPath) {
  if (!fs.existsSync(baselinePath)) {
    return { status: 'no-baseline' };
  }
  if (!fs.existsSync(currentPath)) {
    throw new Error(`Current snapshot not found: ${currentPath}`);
  }

  const [baseline, current] = await Promise.all([
    loadPNG(baselinePath),
    loadPNG(currentPath),
  ]);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      status: 'size-mismatch',
      baseline: { width: baseline.width, height: baseline.height },
      current: { width: current.width, height: current.height },
    };
  }

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  const totalPixels = width * height;
  const diffPercent = (numDiffPixels / totalPixels) * 100;

  if (diffOutputPath && numDiffPixels > 0) {
    const dir = path.dirname(diffOutputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await new Promise((resolve, reject) => {
      diff.pack().pipe(fs.createWriteStream(diffOutputPath))
        .on('finish', resolve)
        .on('error', reject);
    });
  }

  return {
    status: numDiffPixels === 0 ? 'match' : 'diff',
    numDiffPixels,
    diffPercent: parseFloat(diffPercent.toFixed(2)),
    diffOutputPath: numDiffPixels > 0 ? diffOutputPath : null,
  };
}

module.exports = { diffSnapshots };
