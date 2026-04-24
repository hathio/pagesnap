// screenshot-delay.js — parse and apply pre-screenshot delay options

const DEFAULT_DELAY = 0;
const MAX_DELAY = 30000;
const MIN_DELAY = 0;

function clampDelay(ms) {
  return Math.max(MIN_DELAY, Math.min(MAX_DELAY, Math.round(ms)));
}

function parseDelayOptions(input = {}) {
  const opts = typeof input === 'number' ? { delay: input } : input;

  const delay = opts.delay !== undefined ? Number(opts.delay) : DEFAULT_DELAY;

  if (isNaN(delay)) {
    throw new Error(`Invalid delay value: ${opts.delay}`);
  }

  const afterLoad = opts.afterLoad !== undefined ? Number(opts.afterLoad) : 0;
  if (isNaN(afterLoad)) {
    throw new Error(`Invalid afterLoad delay: ${opts.afterLoad}`);
  }

  const afterNetworkIdle = opts.afterNetworkIdle !== undefined
    ? Number(opts.afterNetworkIdle)
    : 0;
  if (isNaN(afterNetworkIdle)) {
    throw new Error(`Invalid afterNetworkIdle delay: ${opts.afterNetworkIdle}`);
  }

  return {
    delay: clampDelay(delay),
    afterLoad: clampDelay(afterLoad),
    afterNetworkIdle: clampDelay(afterNetworkIdle),
  };
}

function totalDelay(opts) {
  const parsed = parseDelayOptions(opts);
  return parsed.delay + parsed.afterLoad + parsed.afterNetworkIdle;
}

function describeDelay(opts) {
  const parsed = parseDelayOptions(opts);
  const parts = [];
  if (parsed.delay > 0) parts.push(`base ${parsed.delay}ms`);
  if (parsed.afterLoad > 0) parts.push(`after-load ${parsed.afterLoad}ms`);
  if (parsed.afterNetworkIdle > 0) parts.push(`after-idle ${parsed.afterNetworkIdle}ms`);
  if (parts.length === 0) return 'no delay';
  return parts.join(', ');
}

function buildDelayScript(opts) {
  const parsed = parseDelayOptions(opts);
  const total = parsed.delay + parsed.afterLoad;
  if (total <= 0) return null;
  return `await new Promise(r => setTimeout(r, ${total}));`;
}

module.exports = { parseDelayOptions, totalDelay, describeDelay, buildDelayScript, clampDelay };
