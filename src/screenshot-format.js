// Defines supported screenshot formats and conversion options

const SUPPORTED_FORMATS = ['png', 'jpeg', 'webp'];

const FORMAT_DEFAULTS = {
  png: { quality: null, mimeType: 'image/png' },
  jpeg: { quality: 80, mimeType: 'image/jpeg' },
  webp: { quality: 80, mimeType: 'image/webp' },
};

function parseFormat(raw) {
  if (!raw) return 'png';
  const fmt = String(raw).toLowerCase().trim();
  if (!SUPPORTED_FORMATS.includes(fmt)) {
    throw new Error(`Unsupported screenshot format: "${fmt}". Choose from: ${SUPPORTED_FORMATS.join(', ')}`);
  }
  return fmt;
}

function buildScreenshotOptions(format, overrides = {}) {
  const base = FORMAT_DEFAULTS[format];
  if (!base) throw new Error(`Unknown format: ${format}`);
  const opts = { type: format, ...base };
  if (overrides.quality != null) opts.quality = Number(overrides.quality);
  // puppeteer ignores quality for png
  if (format === 'png') delete opts.quality;
  return opts;
}

function formatExtension(format) {
  return `.${format}`;
}

function describeFormat(format) {
  const info = FORMAT_DEFAULTS[format];
  if (!info) return `unknown format: ${format}`;
  const qualityNote = info.quality != null ? `, quality ${info.quality}` : '';
  return `${format} (${info.mimeType}${qualityNote})`;
}

module.exports = {
  SUPPORTED_FORMATS,
  FORMAT_DEFAULTS,
  parseFormat,
  buildScreenshotOptions,
  formatExtension,
  describeFormat,
};
