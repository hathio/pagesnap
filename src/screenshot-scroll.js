// screenshot-scroll.js — options for full-page and partial scroll capture

const SCROLL_MODES = ['none', 'full', 'manual'];
const DEFAULT_SCROLL_DELAY = 300;
const MAX_SCROLL_DELAY = 5000;
const MIN_SCROLL_DELAY = 0;

function clampScrollDelay(ms) {
  return Math.max(MIN_SCROLL_DELAY, Math.min(MAX_SCROLL_DELAY, Math.round(ms)));
}

function parseScrollOptions(raw = {}) {
  const mode = raw.mode && SCROLL_MODES.includes(raw.mode) ? raw.mode : 'none';
  const delay = raw.delay !== undefined ? clampScrollDelay(Number(raw.delay)) : DEFAULT_SCROLL_DELAY;
  const steps = raw.steps !== undefined ? Math.max(1, Math.min(50, parseInt(raw.steps, 10))) : 5;
  const scrollTo = raw.scrollTo !== undefined ? Math.max(0, parseInt(raw.scrollTo, 10)) : null;

  return { mode, delay, steps, scrollTo };
}

function buildScrollScript(options) {
  const { mode, delay, steps, scrollTo } = parseScrollOptions(options);

  if (mode === 'none') return null;

  if (mode === 'full') {
    return `
      await (async () => {
        const distance = Math.ceil(document.body.scrollHeight / ${steps});
        for (let i = 0; i < ${steps}; i++) {
          window.scrollBy(0, distance);
          await new Promise(r => setTimeout(r, ${delay}));
        }
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, ${delay}));
      })();
    `.trim();
  }

  if (mode === 'manual' && scrollTo !== null) {
    return `
      await (async () => {
        window.scrollTo(0, ${scrollTo});
        await new Promise(r => setTimeout(r, ${delay}));
      })();
    `.trim();
  }

  return null;
}

function describeScroll(options) {
  const { mode, delay, steps, scrollTo } = parseScrollOptions(options);
  if (mode === 'none') return 'no scroll';
  if (mode === 'full') return `full-page scroll (${steps} steps, ${delay}ms delay)`;
  if (mode === 'manual') return `scroll to ${scrollTo}px (${delay}ms delay)`;
  return 'unknown scroll mode';
}

function listScrollModes() {
  return SCROLL_MODES.map(m => ({
    mode: m,
    description: describeScroll({ mode: m, scrollTo: 0 })
  }));
}

module.exports = { parseScrollOptions, buildScrollScript, describeScroll, listScrollModes, SCROLL_MODES };
