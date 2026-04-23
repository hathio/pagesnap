// crop.js — define and apply crop regions to screenshots before diff/storage

const VALID_ORIGINS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

function parseCropRegion(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('crop region must be an object');
  const { x = 0, y = 0, width, height, origin = 'top-left' } = raw;
  if (typeof width !== 'number' || width <= 0) throw new Error('crop width must be a positive number');
  if (typeof height !== 'number' || height <= 0) throw new Error('crop height must be a positive number');
  if (!VALID_ORIGINS.includes(origin)) throw new Error(`crop origin must be one of: ${VALID_ORIGINS.join(', ')}`);
  return { x, y, width, height, origin };
}

function parseCrops(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(parseCropRegion);
  return [parseCropRegion(input)];
}

function resolveCoordinates(region, imageWidth, imageHeight) {
  let { x, y, width, height, origin } = region;
  if (origin === 'top-right') x = imageWidth - x - width;
  if (origin === 'bottom-left') y = imageHeight - y - height;
  if (origin === 'bottom-right') {
    x = imageWidth - x - width;
    y = imageHeight - y - height;
  }
  x = Math.max(0, x);
  y = Math.max(0, y);
  width = Math.min(width, imageWidth - x);
  height = Math.min(height, imageHeight - y);
  return { x, y, width, height };
}

function buildCropOptions(crops, imageWidth, imageHeight) {
  return crops.map(c => resolveCoordinates(c, imageWidth, imageHeight));
}

function describeCrop(region) {
  const { x, y, width, height, origin } = region;
  return `${width}x${height} at (${x},${y}) from ${origin}`;
}

module.exports = { parseCropRegion, parseCrops, resolveCoordinates, buildCropOptions, describeCrop };
