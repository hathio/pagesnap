// screenshot-cookie.js — parse and apply browser cookies for capture

const VALID_SAMESITE = ['Strict', 'Lax', 'None'];

function parseCookie(raw) {
  if (typeof raw === 'string') {
    const [name, ...rest] = raw.split('=');
    if (!name) throw new Error(`Invalid cookie string: "${raw}"`);
    return { name: name.trim(), value: rest.join('=').trim() };
  }
  if (typeof raw === 'object' && raw !== null) {
    if (!raw.name) throw new Error('Cookie object must have a name');
    return { ...raw };
  }
  throw new Error(`Unsupported cookie format: ${typeof raw}`);
}

function parseCookies(input) {
  if (!input) return [];
  const items = Array.isArray(input) ? input : [input];
  return items.map(parseCookie);
}

function validateCookie(cookie) {
  const errors = [];
  if (!cookie.name) errors.push('Cookie name is required');
  if (cookie.sameSite && !VALID_SAMESITE.includes(cookie.sameSite)) {
    errors.push(`Invalid sameSite value: "${cookie.sameSite}". Must be one of ${VALID_SAMESITE.join(', ')}`);
  }
  if (cookie.expires !== undefined && typeof cookie.expires !== 'number') {
    errors.push('Cookie expires must be a Unix timestamp (number)');
  }
  return errors;
}

function buildCookieScript(cookies) {
  if (!cookies || cookies.length === 0) return '';
  const serialized = JSON.stringify(cookies);
  return `
    for (const c of ${serialized}) {
      document.cookie = Object.entries(c)
        .map(([k, v]) => k === 'name' ? encodeURIComponent(v) : k === 'value' ? '=' + encodeURIComponent(v) : '; ' + k + (v === true ? '' : '=' + v))
        .join('');
    }
  `.trim();
}

function describeCookie(cookie) {
  const parts = [`name=${cookie.name}`, `value=${cookie.value ?? ''}`];
  if (cookie.domain) parts.push(`domain=${cookie.domain}`);
  if (cookie.path) parts.push(`path=${cookie.path}`);
  if (cookie.secure) parts.push('secure');
  if (cookie.httpOnly) parts.push('httpOnly');
  if (cookie.sameSite) parts.push(`sameSite=${cookie.sameSite}`);
  return parts.join(', ');
}

module.exports = { parseCookie, parseCookies, validateCookie, buildCookieScript, describeCookie };
