// timeout.js — parse and apply per-capture timeout options

const DEFAULT_NAVIGATION_TIMEOUT = 30000;
const DEFAULT_WAIT_TIMEOUT = 5000;
const MIN_TIMEOUT = 500;
const MAX_TIMEOUT = 120000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseTimeoutOptions(raw = {}) {
  const navigation = raw.navigationTimeout !== undefined
    ? clamp(Number(raw.navigationTimeout), MIN_TIMEOUT, MAX_TIMEOUT)
    : DEFAULT_NAVIGATION_TIMEOUT;

  const wait = raw.waitTimeout !== undefined
    ? clamp(Number(raw.waitTimeout), MIN_TIMEOUT, MAX_TIMEOUT)
    : DEFAULT_WAIT_TIMEOUT;

  if (isNaN(navigation)) {
    throw new Error(`Invalid navigationTimeout: ${raw.navigationTimeout}`);
  }
  if (isNaN(wait)) {
    throw new Error(`Invalid waitTimeout: ${raw.waitTimeout}`);
  }

  return { navigation, wait };
}

function applyTimeouts(page, options = {}) {
  const { navigation, wait } = parseTimeoutOptions(options);
  page.setDefaultNavigationTimeout(navigation);
  page.setDefaultTimeout(wait);
  return { navigation, wait };
}

function describeTimeout(options = {}) {
  const { navigation, wait } = parseTimeoutOptions(options);
  return `navigation=${navigation}ms, wait=${wait}ms`;
}

function buildTimeoutSummary(options = {}) {
  const { navigation, wait } = parseTimeoutOptions(options);
  return {
    navigationTimeout: navigation,
    waitTimeout: wait,
    isDefault: navigation === DEFAULT_NAVIGATION_TIMEOUT && wait === DEFAULT_WAIT_TIMEOUT,
  };
}

module.exports = {
  parseTimeoutOptions,
  applyTimeouts,
  describeTimeout,
  buildTimeoutSummary,
  DEFAULT_NAVIGATION_TIMEOUT,
  DEFAULT_WAIT_TIMEOUT,
};
