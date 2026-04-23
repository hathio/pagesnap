// screenshot-naming.js — resolve output filenames for captured screenshots

const path = require('path');

const DEFAULT_PATTERN = '{slug}_{viewport}_{timestamp}';

function slugify(url) {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
    .slice(0, 80);
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

function applyPattern(pattern, vars) {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Unknown naming token: {${key}}`);
    return vars[key];
  });
}

function buildNamingVars(url, viewport, options = {}) {
  const slug = options.slug || slugify(url);
  const vp = typeof viewport === 'string' ? viewport : `${viewport.width}x${viewport.height}`;
  const timestamp = options.timestamp || formatTimestamp(options.date);
  const tag = options.tag || '';
  const index = options.index != null ? String(options.index) : '0';
  return { slug, viewport: vp, timestamp, tag, index };
}

function resolveScreenshotName(url, viewport, options = {}) {
  const pattern = options.pattern || DEFAULT_PATTERN;
  const vars = buildNamingVars(url, viewport, options);
  const name = applyPattern(pattern, vars);
  const ext = options.ext || '.png';
  return name + ext;
}

function resolveScreenshotPath(baseDir, url, viewport, options = {}) {
  const filename = resolveScreenshotName(url, viewport, options);
  return path.join(baseDir, filename);
}

function parseNamingPattern(pattern) {
  const tokens = [];
  const re = /\{(\w+)\}/g;
  let m;
  while ((m = re.exec(pattern)) !== null) tokens.push(m[1]);
  return { pattern, tokens };
}

const KNOWN_TOKENS = ['slug', 'viewport', 'timestamp', 'tag', 'index'];

function validateNamingPattern(pattern) {
  const { tokens } = parseNamingPattern(pattern);
  const unknown = tokens.filter(t => !KNOWN_TOKENS.includes(t));
  if (unknown.length) return { valid: false, unknown };
  return { valid: true, unknown: [] };
}

module.exports = {
  slugify,
  formatTimestamp,
  applyPattern,
  buildNamingVars,
  resolveScreenshotName,
  resolveScreenshotPath,
  parseNamingPattern,
  validateNamingPattern,
  DEFAULT_PATTERN,
  KNOWN_TOKENS,
};
