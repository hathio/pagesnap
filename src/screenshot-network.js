// Network condition presets and options for screenshot capture

const PRESETS = {
  fast3g: { downloadThroughput: 1500000, uploadThroughput: 750000, latency: 40 },
  slow3g: { downloadThroughput: 500000, uploadThroughput: 250000, latency: 300 },
  '2g': { downloadThroughput: 150000, uploadThroughput: 75000, latency: 800 },
  offline: { downloadThroughput: 0, uploadThroughput: 0, latency: 0, offline: true },
  broadband: { downloadThroughput: 10000000, uploadThroughput: 5000000, latency: 5 },
};

function listPresets() {
  return Object.keys(PRESETS);
}

function parseNetworkOptions(raw = {}) {
  if (!raw || Object.keys(raw).length === 0) return null;

  if (typeof raw === 'string') {
    const preset = PRESETS[raw.toLowerCase()];
    if (!preset) throw new Error(`Unknown network preset: "${raw}". Valid: ${listPresets().join(', ')}`);
    return { ...preset, preset: raw.toLowerCase() };
  }

  const opts = {};
  if (raw.preset) {
    const base = PRESETS[raw.preset.toLowerCase()];
    if (!base) throw new Error(`Unknown network preset: "${raw.preset}"`);
    Object.assign(opts, base, { preset: raw.preset.toLowerCase() });
  }

  if (raw.downloadThroughput != null) opts.downloadThroughput = Number(raw.downloadThroughput);
  if (raw.uploadThroughput != null) opts.uploadThroughput = Number(raw.uploadThroughput);
  if (raw.latency != null) opts.latency = Number(raw.latency);
  if (raw.offline != null) opts.offline = Boolean(raw.offline);

  if (opts.downloadThroughput < 0) throw new Error('downloadThroughput must be >= 0');
  if (opts.latency < 0) throw new Error('latency must be >= 0');

  return Object.keys(opts).length ? opts : null;
}

function buildNetworkScript(opts) {
  if (!opts) return '';
  return `
// apply network conditions
await page.emulateNetworkConditions(${JSON.stringify(opts)});
`.trim();
}

function describeNetwork(opts) {
  if (!opts) return 'no throttling';
  if (opts.offline) return 'offline';
  const dl = opts.downloadThroughput != null ? `dl:${(opts.downloadThroughput / 1000).toFixed(0)}kbps` : '';
  const lat = opts.latency != null ? `latency:${opts.latency}ms` : '';
  const label = opts.preset ? `[${opts.preset}] ` : '';
  return `${label}${[dl, lat].filter(Boolean).join(', ')}`;
}

module.exports = { parseNetworkOptions, buildNetworkScript, describeNetwork, listPresets, PRESETS };
