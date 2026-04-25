// screenshot-click.js — click interaction before capture

const VALID_BUTTONS = ['left', 'right', 'middle'];
const DEFAULT_DELAY = 100;
const MAX_DELAY = 5000;

function clampClickDelay(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) return DEFAULT_DELAY;
  return Math.max(0, Math.min(ms, MAX_DELAY));
}

function parseClickTarget(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('click target must be a non-empty string');
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('click target must be a non-empty string');
  return trimmed;
}

function parseClickOptions(opts = {}) {
  const {
    selector = null,
    x = null,
    y = null,
    button = 'left',
    delay = DEFAULT_DELAY,
    double = false,
    waitForNav = false,
  } = opts;

  if (!VALID_BUTTONS.includes(button)) {
    throw new Error(`invalid button "${button}"; expected one of: ${VALID_BUTTONS.join(', ')}`);
  }

  if (selector === null && (x === null || y === null)) {
    throw new Error('click requires either a selector or both x and y coordinates');
  }

  if (x !== null && (typeof x !== 'number' || x < 0)) throw new Error('x must be a non-negative number');
  if (y !== null && (typeof y !== 'number' || y < 0)) throw new Error('y must be a non-negative number');

  return {
    selector: selector ? parseClickTarget(selector) : null,
    x,
    y,
    button,
    delay: clampClickDelay(delay),
    double: Boolean(double),
    waitForNav: Boolean(waitForNav),
  };
}

function buildClickScript(options) {
  const { selector, x, y, button, delay, double, waitForNav } = options;
  const clickMethod = double ? 'dblclick' : 'click';
  const navWrap = waitForNav
    ? (inner) => `await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle0' }), ${inner}]);`
    : (inner) => `await ${inner};`;

  if (selector) {
    const action = `page.${clickMethod}(${JSON.stringify(selector)}, { button: ${JSON.stringify(button)}, delay: ${delay} })`;
    return navWrap(action);
  }
  const action = `page.mouse.${clickMethod}(${x}, ${y}, { button: ${JSON.stringify(button)}, delay: ${delay} })`;
  return navWrap(action);
}

function describeClick(options) {
  const { selector, x, y, button, double, waitForNav } = options;
  const target = selector ? `selector "${selector}"` : `(${x}, ${y})`;
  const type = double ? 'double-click' : 'click';
  const nav = waitForNav ? ', wait for navigation' : '';
  return `${type} ${target} with ${button} button${nav}`;
}

module.exports = { parseClickOptions, buildClickScript, describeClick, clampClickDelay };
