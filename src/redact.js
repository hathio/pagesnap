// redact.js — mask sensitive values in URLs and metadata before storing/reporting

const DEFAULT_PATTERNS = [
  /([?&])(token|api_key|apikey|key|secret|password|passwd|auth|access_token)=([^&]*)/gi,
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
  /Basic\s+[A-Za-z0-9+/]+=*/g,
];

const REDACTED = '[REDACTED]';

/**
 * Redact sensitive query params and auth headers from a URL string.
 * @param {string} url
 * @param {RegExp[]} [extraPatterns]
 * @returns {string}
 */
function redactUrl(url, extraPatterns = []) {
  if (typeof url !== 'string') return url;
  let result = url;
  const patterns = [...DEFAULT_PATTERNS, ...extraPatterns];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match, prefix, name) => {
      // For query param pattern we have named groups via positional args
      if (prefix && name) return `${prefix}${name}=${REDACTED}`;
      return REDACTED;
    });
  }
  return result;
}

/**
 * Recursively redact sensitive keys from a plain object.
 * @param {object} obj
 * @param {string[]} [sensitiveKeys]
 * @returns {object}
 */
function redactObject(obj, sensitiveKeys = []) {
  const defaultKeys = ['token', 'secret', 'password', 'apiKey', 'api_key', 'auth', 'authorization'];
  const keys = new Set([...defaultKeys, ...sensitiveKeys].map(k => k.toLowerCase()));

  if (Array.isArray(obj)) return obj.map(item => redactObject(item, sensitiveKeys));
  if (obj === null || typeof obj !== 'object') return obj;

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (keys.has(k.toLowerCase())) return [k, REDACTED];
      if (typeof v === 'object') return [k, redactObject(v, sensitiveKeys)];
      return [k, v];
    })
  );
}

/**
 * Build redact options from config.
 * @param {object} config
 * @returns {{ extraPatterns: RegExp[], sensitiveKeys: string[] }}
 */
function buildRedactOptions(config = {}) {
  const redactCfg = config.redact || {};
  const extraPatterns = (redactCfg.patterns || []).map(p => new RegExp(p, 'gi'));
  const sensitiveKeys = redactCfg.keys || [];
  return { extraPatterns, sensitiveKeys };
}

module.exports = { redactUrl, redactObject, buildRedactOptions, REDACTED };
