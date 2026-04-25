// screenshot-hover.js — hover state capture options

const VALID_TRIGGERS = ['css', 'js', 'none'];

function parseHoverTarget(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed;
}

function parseHoverOptions(args = {}) {
  const trigger = args.trigger || 'css';
  if (!VALID_TRIGGERS.includes(trigger)) {
    throw new Error(`Invalid hover trigger: "${trigger}". Must be one of: ${VALID_TRIGGERS.join(', ')}`);
  }

  const selector = parseHoverTarget(args.selector);
  const delay = Math.max(0, parseInt(args.delay ?? 200, 10));
  const restoreAfter = args.restoreAfter !== false;

  return { selector, trigger, delay, restoreAfter };
}

function buildHoverScript(options) {
  if (!options || !options.selector) return null;

  const { selector, trigger, delay, restoreAfter } = options;

  if (trigger === 'none') return null;

  if (trigger === 'js') {
    return `
      (async () => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
          el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          await new Promise(r => setTimeout(r, ${delay}));
        }
      })()
    `.trim();
  }

  // css trigger — add a class to force :hover-like styles
  return `
    (async () => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (el) {
        el.classList.add('pagesnap-hover');
        await new Promise(r => setTimeout(r, ${delay}));
        ${restoreAfter ? '' : '// restoreAfter disabled'}
      }
    })()
  `.trim();
}

function describeHover(options) {
  if (!options || !options.selector) return 'no hover';
  const { selector, trigger, delay, restoreAfter } = options;
  return `hover on "${selector}" via ${trigger}, delay ${delay}ms${restoreAfter ? ', restore' : ''}`;
}

module.exports = { parseHoverOptions, buildHoverScript, describeHover, parseHoverTarget };
