// screenshot-localStorage.js — inject localStorage entries before capture

/**
 * Parse a single key=value localStorage entry.
 * @param {string} raw
 * @returns {{ key: string, value: string }}
 */
function parseLocalStorageEntry(raw) {
  const idx = raw.indexOf('=');
  if (idx < 1) throw new Error(`Invalid localStorage entry (expected key=value): "${raw}"`);
  const key = raw.slice(0, idx).trim();
  const value = raw.slice(idx + 1);
  if (!key) throw new Error(`localStorage key must not be empty in: "${raw}"`);
  return { key, value };
}

/**
 * Parse an array of raw "key=value" strings.
 * @param {string[]} raws
 * @returns {{ key: string, value: string }[]}
 */
function parseLocalStorageEntries(raws) {
  if (!Array.isArray(raws) || raws.length === 0) return [];
  return raws.map(parseLocalStorageEntry);
}

/**
 * Build a Playwright / Puppeteer-compatible script snippet that sets
 * localStorage entries before the page loads meaningful content.
 * Intended to be evaluated via page.evaluateOnNewDocument().
 *
 * @param {{ key: string, value: string }[]} entries
 * @returns {string}
 */
function buildLocalStorageScript(entries) {
  if (!entries || entries.length === 0) return '';
  const lines = entries.map(
    ({ key, value }) =>
      `  window.localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)});`
  );
  return `(function () {
${lines.join('\n')}
})();`;
}

/**
 * Human-readable summary of the entries that will be injected.
 * @param {{ key: string, value: string }[]} entries
 * @returns {string}
 */
function describeLocalStorage(entries) {
  if (!entries || entries.length === 0) return 'localStorage: none';
  const parts = entries.map(({ key, value }) => {
    const preview = value.length > 40 ? value.slice(0, 37) + '...' : value;
    return `${key}=${preview}`;
  });
  return `localStorage (${entries.length}): ${parts.join(', ')}`;
}

module.exports = {
  parseLocalStorageEntry,
  parseLocalStorageEntries,
  buildLocalStorageScript,
  describeLocalStorage,
};
