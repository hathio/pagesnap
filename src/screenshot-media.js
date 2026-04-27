// screenshot-media.js — control media type (print/screen) and reduced-motion for captures

const VALID_MEDIA_TYPES = ['screen', 'print'];

const MEDIA_PRESETS = {
  screen: { type: 'screen', reducedMotion: false },
  print: { type: 'print', reducedMotion: false },
  accessible: { type: 'screen', reducedMotion: true },
};

function parseMediaOptions(input = {}) {
  const type = input.mediaType || input.type || 'screen';
  if (!VALID_MEDIA_TYPES.includes(type)) {
    throw new Error(`Invalid media type: "${type}". Must be one of: ${VALID_MEDIA_TYPES.join(', ')}`);
  }
  const reducedMotion = Boolean(input.reducedMotion ?? false);
  return { type, reducedMotion };
}

function applyPreset(name) {
  if (!MEDIA_PRESETS[name]) {
    throw new Error(`Unknown media preset: "${name}". Available: ${Object.keys(MEDIA_PRESETS).join(', ')}`);
  }
  return { ...MEDIA_PRESETS[name] };
}

function buildMediaScript(options) {
  const { type, reducedMotion } = options;
  const lines = [];
  if (type && type !== 'screen') {
    lines.push(`await page.emulateMediaType('${type}');`);
  }
  if (reducedMotion) {
    lines.push(`await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);`);
  }
  return lines.join('\n');
}

function describeMedia(options) {
  const parts = [`media type: ${options.type}`];
  if (options.reducedMotion) parts.push('reduced-motion: enabled');
  return parts.join(', ');
}

function listPresets() {
  return Object.entries(MEDIA_PRESETS).map(([name, opts]) => ({ name, ...opts }));
}

module.exports = { parseMediaOptions, applyPreset, buildMediaScript, describeMedia, listPresets, VALID_MEDIA_TYPES };
