import sharp from 'sharp';

const RESIZE_MODES = ['cover', 'contain', 'fill', 'inside', 'outside'];

export function parseResizeOptions(opts = {}) {
  const width = opts.width ? parseInt(opts.width, 10) : undefined;
  const height = opts.height ? parseInt(opts.height, 10) : undefined;
  const mode = opts.mode || 'cover';
  const background = opts.background || '#ffffff';

  if (width !== undefined && (isNaN(width) || width <= 0)) {
    throw new Error(`Invalid resize width: ${opts.width}`);
  }
  if (height !== undefined && (isNaN(height) || height <= 0)) {
    throw new Error(`Invalid resize height: ${opts.height}`);
  }
  if (!RESIZE_MODES.includes(mode)) {
    throw new Error(`Unknown resize mode "${mode}". Valid: ${RESIZE_MODES.join(', ')}`);
  }
  if (!width && !height) {
    throw new Error('At least one of width or height must be specified');
  }

  return { width, height, mode, background };
}

export async function resizeImage(inputPath, outputPath, resizeOptions) {
  const { width, height, mode, background } = resizeOptions;
  await sharp(inputPath)
    .resize({
      width,
      height,
      fit: mode,
      background,
      withoutEnlargement: false,
    })
    .toFile(outputPath);
}

export function describeResize(opts) {
  const dims = [opts.width && `w:${opts.width}`, opts.height && `h:${opts.height}`]
    .filter(Boolean)
    .join(' ');
  return `resize(${dims}, mode=${opts.mode})`;
}

export function buildResizeSuffix(opts) {
  const parts = [];
  if (opts.width) parts.push(`w${opts.width}`);
  if (opts.height) parts.push(`h${opts.height}`);
  parts.push(opts.mode);
  return parts.join('-');
}
