// viewport.js — parse and manage viewport presets for captures

const PRESETS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
};

/**
 * Parse a viewport string like "1280x800" or a named preset.
 * @param {string} input
 * @returns {{ width: number, height: number }}
 */
function parseViewport(input) {
  if (!input) return PRESETS.desktop;

  const preset = PRESETS[input.toLowerCase()];
  if (preset) return { ...preset };

  const match = input.match(/^(\d+)[xX](\d+)$/);
  if (!match) {
    throw new Error(
      `Invalid viewport "${input}". Use a preset (${Object.keys(PRESETS).join(', ')}) or WxH format.`
    );
  }

  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);

  if (width < 1 || height < 1) {
    throw new Error(`Viewport dimensions must be positive integers.`);
  }

  return { width, height };
}

/**
 * Resolve one or more viewport specs into an array of viewport objects.
 * Accepts a single string or an array of strings.
 * @param {string|string[]} input
 * @returns {Array<{ name: string, width: number, height: number }>}
 */
function resolveViewports(input) {
  const specs = Array.isArray(input) ? input : [input || 'desktop'];
  return specs.map((spec) => {
    const dims = parseViewport(spec);
    const isPreset = Object.prototype.hasOwnProperty.call(PRESETS, spec.toLowerCase());
    return { name: isPreset ? spec.toLowerCase() : `${dims.width}x${dims.height}`, ...dims };
  });
}

/**
 * Return a human-readable description of a viewport object.
 * @param {{ name: string, width: number, height: number }} viewport
 * @returns {string}
 */
function describeViewport(viewport) {
  return `${viewport.name} (${viewport.width}x${viewport.height})`;
}

function listPresets() {
  return Object.entries(PRESETS).map(([name, dims]) => ({ name, ...dims }));
}

module.exports = { parseViewport, resolveViewports, describeViewport, listPresets, PRESETS };
