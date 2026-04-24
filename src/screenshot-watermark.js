// screenshot-watermark.js — apply text or image watermarks to screenshots

const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];
const DEFAULT_OPACITY = 0.5;
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_POSITION = 'bottom-right';

function parseWatermarkOptions(opts = {}) {
  if (!opts || typeof opts !== 'object') {
    return null;
  }

  const { text, image, position, opacity, fontSize, color, padding } = opts;

  if (!text && !image) return null;
  if (text && image) throw new Error('watermark: specify either text or image, not both');

  if (position && !POSITIONS.includes(position)) {
    throw new Error(`watermark: invalid position "${position}". Must be one of: ${POSITIONS.join(', ')}`);
  }

  if (opacity !== undefined) {
    const op = Number(opacity);
    if (isNaN(op) || op < 0 || op > 1) {
      throw new Error('watermark: opacity must be a number between 0 and 1');
    }
  }

  if (fontSize !== undefined) {
    const fs = Number(fontSize);
    if (isNaN(fs) || fs < 4 || fs > 200) {
      throw new Error('watermark: fontSize must be between 4 and 200');
    }
  }

  return {
    type: text ? 'text' : 'image',
    text: text || null,
    image: image || null,
    position: position || DEFAULT_POSITION,
    opacity: opacity !== undefined ? Number(opacity) : DEFAULT_OPACITY,
    fontSize: fontSize !== undefined ? Number(fontSize) : DEFAULT_FONT_SIZE,
    color: color || '#ffffff',
    padding: padding !== undefined ? Number(padding) : 8,
  };
}

function describeWatermark(opts) {
  if (!opts) return 'no watermark';
  const kind = opts.type === 'text' ? `text "${opts.text}"` : `image "${opts.image}"`;
  return `${kind} at ${opts.position} (opacity ${opts.opacity}, padding ${opts.padding}px)`;
}

function buildWatermarkScript(opts) {
  if (!opts) return null;
  // Returns a serializable config for injection into a Playwright/Puppeteer page context
  return {
    enabled: true,
    type: opts.type,
    text: opts.text,
    image: opts.image,
    position: opts.position,
    opacity: opts.opacity,
    fontSize: opts.fontSize,
    color: opts.color,
    padding: opts.padding,
  };
}

module.exports = { parseWatermarkOptions, describeWatermark, buildWatermarkScript, POSITIONS };
