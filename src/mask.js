// mask.js — define rectangular regions to exclude from screenshots/diffs

const DEFAULT_COLOR = [0, 0, 0]; // black fill

/**
 * Parse a mask region from a string like "10,20,300,400" or an object.
 * Returns { x, y, width, height, color }
 */
function parseMaskRegion(input) {
  if (typeof input === 'string') {
    const parts = input.split(',').map(Number);
    if (parts.length < 4 || parts.some(isNaN)) {
      throw new Error(`Invalid mask region: "${input}" — expected "x,y,width,height"`);
    }
    const [x, y, width, height] = parts;
    return { x, y, width, height, color: DEFAULT_COLOR };
  }
  if (typeof input === 'object' && input !== null) {
    const { x = 0, y = 0, width, height, color = DEFAULT_COLOR } = input;
    if (width == null || height == null) {
      throw new Error('Mask region object must include width and height');
    }
    return { x, y, width: Number(width), height: Number(height), color };
  }
  throw new Error(`Unsupported mask region type: ${typeof input}`);
}

/**
 * Parse an array of mask region definitions.
 */
function parseMasks(regions = []) {
  return regions.map(parseMaskRegion);
}

/**
 * Apply mask regions to a Playwright page before screenshot.
 * Injects a fixed-position overlay div for each region.
 */
async function applyMasks(page, regions = []) {
  if (!regions.length) return;
  await page.evaluate((masks) => {
    masks.forEach(({ x, y, width, height, color }) => {
      const el = document.createElement('div');
      el.setAttribute('data-pagesnap-mask', 'true');
      const [r, g, b] = color;
      Object.assign(el.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: `rgb(${r},${g},${b})`,
        zIndex: '2147483647',
        pointerEvents: 'none',
      });
      document.body.appendChild(el);
    });
  }, regions);
}

/**
 * Remove all mask overlays injected by applyMasks.
 */
async function removeMasks(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-pagesnap-mask]').forEach((el) => el.remove());
  });
}

/**
 * Describe a mask region as a human-readable string.
 */
function describeMask(region) {
  return `rect(${region.x},${region.y},${region.width}x${region.height})`;
}

module.exports = { parseMaskRegion, parseMasks, applyMasks, removeMasks, describeMask };
