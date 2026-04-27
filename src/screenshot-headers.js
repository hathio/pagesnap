// Custom HTTP headers for screenshot requests

const SENSITIVE_KEYS = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

function parseHeader(raw) {
  if (typeof raw !== 'string') throw new Error('Header must be a string');
  const idx = raw.indexOf(':');
  if (idx < 1) throw new Error(`Invalid header format: "${raw}" (expected "Name: Value")`);
  const name = raw.slice(0, idx).trim();
  const value = raw.slice(idx + 1).trim();
  if (!name) throw new Error('Header name cannot be empty');
  return { name, value };
}

function parseHeaders(input) {
  if (!input) return [];
  const raws = Array.isArray(input) ? input : [input];
  return raws.map(parseHeader);
}

function buildHeadersMap(headers) {
  const map = {};
  for (const { name, value } of headers) {
    map[name] = value;
  }
  return map;
}

function mergeHeaders(...sources) {
  const result = {};
  for (const src of sources) {
    if (!src) continue;
    const entries = Array.isArray(src) ? buildHeadersMap(src) : src;
    Object.assign(result, entries);
  }
  return result;
}

function redactSensitiveHeaders(headers) {
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    out[k] = SENSITIVE_KEYS.includes(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return out;
}

function describeHeaders(headers) {
  if (!headers || Object.keys(headers).length === 0) return 'no custom headers';
  const redacted = redactSensitiveHeaders(headers);
  return Object.entries(redacted)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}

function applyHeadersToPage(page, headers) {
  if (!headers || Object.keys(headers).length === 0) return Promise.resolve();
  return page.setExtraHTTPHeaders(headers);
}

module.exports = {
  parseHeader,
  parseHeaders,
  buildHeadersMap,
  mergeHeaders,
  redactSensitiveHeaders,
  describeHeaders,
  applyHeadersToPage,
};
