export const COMPARE_STRATEGIES = ['pixel', 'ssim', 'perceptual'];

export function parseCompareStrategy(value) {
  const s = (value ?? 'pixel').toLowerCase();
  if (!COMPARE_STRATEGIES.includes(s)) {
    throw new Error(
      `Unknown compare strategy "${s}". Valid options: ${COMPARE_STRATEGIES.join(', ')}`
    );
  }
  return s;
}

export function buildDiffOptions(strategy, config = {}) {
  const base = {
    threshold: config.diffThreshold ?? 0.01,
  };

  switch (strategy) {
    case 'pixel':
      return { ...base, method: 'pixel' };
    case 'ssim':
      return { ...base, method: 'ssim', ssimThreshold: config.ssimThreshold ?? 0.98 };
    case 'perceptual':
      return { ...base, method: 'perceptual', tolerance: config.perceptualTolerance ?? 5 };
    default:
      return base;
  }
}

export function describeCompareStrategy(strategy) {
  switch (strategy) {
    case 'pixel':      return 'Exact pixel-by-pixel comparison';
    case 'ssim':       return 'Structural similarity index (SSIM)';
    case 'perceptual': return 'Perceptual color difference (deltaE)';
    default:           return strategy;
  }
}
