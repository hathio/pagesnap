// screenshot-darkmode.js — dark mode / color scheme emulation options

const VALID_SCHEMES = ['light', 'dark', 'no-preference'];

/**
 * @param {string|boolean} value
 * @returns {{ scheme: string }}
 */
function parseDarkMode(value) {
  if (value === true || value === 'dark') {
    return { scheme: 'dark' };
  }
  if (value === false || value === 'light') {
    return { scheme: 'light' };
  }
  if (value === 'no-preference') {
    return { scheme: 'no-preference' };
  }
  if (typeof value === 'string' && VALID_SCHEMES.includes(value.toLowerCase())) {
    return { scheme: value.toLowerCase() };
  }
  throw new Error(
    `Invalid color scheme "${value}". Valid options: ${VALID_SCHEMES.join(', ')}`
  );
}

/**
 * Build Playwright/Puppeteer emulation options for color scheme.
 * @param {{ scheme: string }} opts
 * @returns {object}
 */
function buildDarkModeContext(opts) {
  return {
    colorScheme: opts.scheme,
  };
}

/**
 * Return a human-readable description of the dark mode setting.
 * @param {{ scheme: string }} opts
 * @returns {string}
 */
function describeDarkMode(opts) {
  const labels = {
    dark: 'Dark mode enabled',
    light: 'Light mode (forced)',
    'no-preference': 'No color scheme preference',
  };
  return labels[opts.scheme] || `Color scheme: ${opts.scheme}`;
}

/**
 * List all valid color scheme values.
 * @returns {string[]}
 */
function listSchemes() {
  return [...VALID_SCHEMES];
}

module.exports = { parseDarkMode, buildDarkModeContext, describeDarkMode, listSchemes };
