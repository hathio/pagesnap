// Full-page screenshot options: stitch, lazy-load, scroll-pause

const VALID_MODES = ['stitch', 'native', 'lazy'];
const DEFAULT_SCROLL_PAUSE = 150;
const MAX_SCROLL_PAUSE = 5000;
const MIN_SCROLL_PAUSE = 0;

function clampScrollPause(ms) {
  return Math.max(MIN_SCROLL_PAUSE, Math.min(MAX_SCROLL_PAUSE, Math.round(ms)));
}

function parseFullPageOptions(input = {}) {
  const mode = input.mode && VALID_MODES.includes(input.mode) ? input.mode : 'native';
  const scrollPause = input.scrollPause !== undefined
    ? clampScrollPause(Number(input.scrollPause))
    : DEFAULT_SCROLL_PAUSE;
  const maxHeight = input.maxHeight ? Math.max(1, Math.round(Number(input.maxHeight))) : null;
  const lazySelector = typeof input.lazySelector === 'string' ? input.lazySelector.trim() : null;

  return { mode, scrollPause, maxHeight, lazySelector };
}

function buildFullPageScript(opts) {
  const { mode, scrollPause, lazySelector } = opts;
  if (mode === 'native') return null;

  const parts = [];
  if (mode === 'lazy' && lazySelector) {
    parts.push(`// trigger lazy-load for selector: ${lazySelector}`);
    parts.push(`const lazyEls = document.querySelectorAll(${JSON.stringify(lazySelector)});`);
    parts.push(`for (const el of lazyEls) { el.scrollIntoView(); }`);
  } else {
    parts.push(`// scroll to trigger lazy-load`);
    parts.push(`await new Promise(r => { let y = 0; const id = setInterval(() => { window.scrollBy(0, 200); y += 200; if (y >= document.body.scrollHeight) { clearInterval(id); r(); } }, ${scrollPause}); });`);
  }
  parts.push(`window.scrollTo(0, 0);`);
  return parts.join('\n');
}

function describeFullPage(opts) {
  const { mode, scrollPause, maxHeight, lazySelector } = opts;
  const parts = [`mode: ${mode}`];
  if (mode !== 'native') parts.push(`scrollPause: ${scrollPause}ms`);
  if (maxHeight) parts.push(`maxHeight: ${maxHeight}px`);
  if (lazySelector) parts.push(`lazySelector: "${lazySelector}"`);
  return `full-page(${parts.join(', ')})`;
}

function listModes() {
  return [
    { name: 'native', description: 'Browser native full-page capture (default)' },
    { name: 'stitch', description: 'Scroll and stitch screenshots together' },
    { name: 'lazy',   description: 'Scroll to trigger lazy-loaded content before capture' },
  ];
}

module.exports = { parseFullPageOptions, buildFullPageScript, describeFullPage, listModes, clampScrollPause };
