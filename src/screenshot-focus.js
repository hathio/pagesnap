// screenshot-focus.js — element focus / wait-for-selector helpers

const VALID_STRATEGIES = ['css', 'xpath', 'text'];
const DEFAULT_TIMEOUT = 5000;

function parseFocusOptions(opts = {}) {
  const {
    selector = null,
    strategy = 'css',
    timeout = DEFAULT_TIMEOUT,
    scrollIntoView = true,
    highlightColor = null,
  } = opts;

  if (strategy && !VALID_STRATEGIES.includes(strategy)) {
    throw new Error(`Unknown focus strategy "${strategy}". Valid: ${VALID_STRATEGIES.join(', ')}`);
  }

  if (typeof timeout !== 'number' || timeout < 0) {
    throw new Error(`timeout must be a non-negative number, got ${timeout}`);
  }

  return { selector, strategy, timeout, scrollIntoView, highlightColor };
}

function buildFocusScript(options) {
  const { selector, strategy, scrollIntoView, highlightColor } = options;
  if (!selector) return null;

  const lines = [];

  if (strategy === 'xpath') {
    lines.push(
      `const __xr = document.evaluate(${JSON.stringify(selector)}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);`,
      `const __el = __xr.singleNodeValue;`
    );
  } else if (strategy === 'text') {
    lines.push(
      `const __el = Array.from(document.querySelectorAll('*')).find(e => e.textContent.trim() === ${JSON.stringify(selector)});`
    );
  } else {
    lines.push(`const __el = document.querySelector(${JSON.stringify(selector)});`);
  }

  if (scrollIntoView) {
    lines.push(`if (__el) __el.scrollIntoView({ block: 'center', inline: 'center' });`);
  }

  if (highlightColor) {
    lines.push(`if (__el) __el.style.outline = '3px solid ${highlightColor}';`);
  }

  return lines.join('\n');
}

function describeFocus(options) {
  const { selector, strategy, timeout, scrollIntoView, highlightColor } = options;
  if (!selector) return 'no focus selector';
  const parts = [`selector: "${selector}" (${strategy})`, `timeout: ${timeout}ms`];
  if (scrollIntoView) parts.push('scroll-into-view');
  if (highlightColor) parts.push(`highlight: ${highlightColor}`);
  return parts.join(', ');
}

module.exports = { parseFocusOptions, buildFocusScript, describeFocus, VALID_STRATEGIES };
