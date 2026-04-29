// Device emulation options for screenshots

const DEVICE_PRESETS = {
  'iphone-14': { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' },
  'iphone-se': { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15' },
  'pixel-7': { width: 412, height: 915, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36' },
  'ipad-pro': { width: 1024, height: 1366, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15' },
  'galaxy-s21': { width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 11; Samsung Galaxy S21) AppleWebKit/537.36' },
  'desktop-hd': { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false, userAgent: null },
  'desktop-4k': { width: 3840, height: 2160, deviceScaleFactor: 2, isMobile: false, hasTouch: false, userAgent: null },
};

function listPresets() {
  return Object.keys(DEVICE_PRESETS);
}

function parseEmulateOptions(raw = {}) {
  if (!raw || Object.keys(raw).length === 0) return null;

  const preset = raw.preset ? DEVICE_PRESETS[raw.preset] : null;
  if (raw.preset && !preset) {
    throw new Error(`Unknown device preset: "${raw.preset}". Use one of: ${listPresets().join(', ')}`);
  }

  const base = preset || {};
  return {
    preset: raw.preset || null,
    width: raw.width ?? base.width ?? null,
    height: raw.height ?? base.height ?? null,
    deviceScaleFactor: raw.deviceScaleFactor ?? base.deviceScaleFactor ?? 1,
    isMobile: raw.isMobile ?? base.isMobile ?? false,
    hasTouch: raw.hasTouch ?? base.hasTouch ?? false,
    userAgent: raw.userAgent ?? base.userAgent ?? null,
  };
}

function buildEmulateScript(opts) {
  if (!opts) return '';
  const parts = [];
  if (opts.userAgent) {
    parts.push(`await page.setUserAgent(${JSON.stringify(opts.userAgent)});`);
  }
  if (opts.width && opts.height) {
    const vp = { width: opts.width, height: opts.height, deviceScaleFactor: opts.deviceScaleFactor, isMobile: opts.isMobile, hasTouch: opts.hasTouch };
    parts.push(`await page.setViewport(${JSON.stringify(vp)});`);
  }
  return parts.join('\n');
}

function describeEmulate(opts) {
  if (!opts) return 'no device emulation';
  if (opts.preset) return `emulate device: ${opts.preset} (${opts.width}x${opts.height}, dpr=${opts.deviceScaleFactor})`;
  return `custom emulation: ${opts.width}x${opts.height}, dpr=${opts.deviceScaleFactor}, mobile=${opts.isMobile}`;
}

module.exports = { parseEmulateOptions, buildEmulateScript, describeEmulate, listPresets, DEVICE_PRESETS };
