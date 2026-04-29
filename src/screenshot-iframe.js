// screenshot-iframe.js — iframe interaction options for capture pipeline

const IFRAME_SELECTORS = {
  first: 'iframe:first-of-type',
  main: 'iframe[name="main"]',
  content: 'iframe[name="content"]',
};

function clampIframeTimeout(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) return 3000;
  return Math.max(500, Math.min(ms, 30000));
}

function parseIframeOptions(raw = {}) {
  if (!raw || typeof raw !== 'object') return null;

  const selector = raw.selector || raw.sel || null;
  const index = typeof raw.index === 'number' ? Math.max(0, raw.index) : null;
  const name = raw.name || null;
  const src = raw.src || null;
  const waitTimeout = clampIframeTimeout(raw.waitTimeout ?? raw.timeout ?? 3000);
  const scrollIntoView = raw.scrollIntoView !== false;
  const waitForLoad = raw.waitForLoad !== false;

  if (!selector && index === null && !name && !src) {
    return null;
  }

  return { selector, index, name, src, waitTimeout, scrollIntoView, waitForLoad };
}

function resolveIframeSelector(opts) {
  if (!opts) return null;
  if (opts.selector) return opts.selector;
  if (opts.name) return `iframe[name="${opts.name}"]`;
  if (opts.src) return `iframe[src*="${opts.src}"]`;
  if (opts.index !== null) return `iframe:nth-of-type(${opts.index + 1})`;
  return 'iframe';
}

function buildIframeScript(opts) {
  if (!opts) return '';
  const sel = resolveIframeSelector(opts);
  const timeout = opts.waitTimeout;
  const scroll = opts.scrollIntoView;

  const lines = [];
  if (scroll) {
    lines.push(`const __iframe = document.querySelector(${JSON.stringify(sel)});`);
    lines.push(`if (__iframe) __iframe.scrollIntoView({ block: 'center' });`);
  }
  if (opts.waitForLoad) {
    lines.push(`await new Promise((resolve, reject) => {`);
    lines.push(`  const el = document.querySelector(${JSON.stringify(sel)});`);
    lines.push(`  if (!el) return reject(new Error('iframe not found: ${sel}'));`);
    lines.push(`  if (el.contentDocument && el.contentDocument.readyState === 'complete') return resolve();`);
    lines.push(`  const t = setTimeout(() => reject(new Error('iframe load timeout')), ${timeout});`);
    lines.push(`  el.addEventListener('load', () => { clearTimeout(t); resolve(); }, { once: true });`);
    lines.push(`});`);
  }
  return lines.join('\n');
}

function describeIframe(opts) {
  if (!opts) return 'no iframe targeting';
  const sel = resolveIframeSelector(opts);
  const parts = [`selector: ${sel}`, `waitTimeout: ${opts.waitTimeout}ms`];
  if (opts.scrollIntoView) parts.push('scroll into view');
  if (opts.waitForLoad) parts.push('wait for load');
  return parts.join(', ');
}

module.exports = {
  clampIframeTimeout,
  parseIframeOptions,
  resolveIframeSelector,
  buildIframeScript,
  describeIframe,
  IFRAME_SELECTORS,
};
