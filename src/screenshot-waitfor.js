// Wait-for conditions before capturing a screenshot

const VALID_TYPES = ['selector', 'network', 'timeout', 'function'];
const DEFAULT_TIMEOUT = 5000;
const MAX_TIMEOUT = 60000;

function clampWaitTimeout(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) return DEFAULT_TIMEOUT;
  return Math.min(Math.max(0, ms), MAX_TIMEOUT);
}

function parseWaitCondition(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Wait condition must be an object');
  const type = raw.type || 'selector';
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Unknown wait type: ${type}. Valid: ${VALID_TYPES.join(', ')}`);
  }
  const timeout = clampWaitTimeout(raw.timeout ?? DEFAULT_TIMEOUT);
  if (type === 'selector') {
    if (!raw.selector || typeof raw.selector !== 'string') {
      throw new Error('Wait condition of type selector requires a selector string');
    }
    return { type, selector: raw.selector, timeout };
  }
  if (type === 'function') {
    if (!raw.fn || typeof raw.fn !== 'string') {
      throw new Error('Wait condition of type function requires a fn string');
    }
    return { type, fn: raw.fn, timeout };
  }
  if (type === 'network') {
    return { type, idle: raw.idle ?? 'networkidle2', timeout };
  }
  // timeout type
  return { type, timeout };
}

function parseWaitConditions(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(parseWaitCondition);
}

function buildWaitScript(conditions) {
  if (!conditions || conditions.length === 0) return null;
  const parts = conditions.map(c => {
    if (c.type === 'selector') {
      return `await page.waitForSelector(${JSON.stringify(c.selector)}, { timeout: ${c.timeout} });`;
    }
    if (c.type === 'function') {
      return `await page.waitForFunction(${c.fn}, { timeout: ${c.timeout} });`;
    }
    if (c.type === 'network') {
      return `await page.waitForNavigation({ waitUntil: ${JSON.stringify(c.idle)}, timeout: ${c.timeout} });`;
    }
    return `await new Promise(r => setTimeout(r, ${c.timeout}));`;
  });
  return parts.join('\n');
}

function describeWait(condition) {
  if (condition.type === 'selector') return `wait for selector "${condition.selector}" (${condition.timeout}ms)`;
  if (condition.type === 'function') return `wait for function (${condition.timeout}ms)`;
  if (condition.type === 'network') return `wait for network idle: ${condition.idle} (${condition.timeout}ms)`;
  return `wait ${condition.timeout}ms`;
}

function listWaitTypes() {
  return VALID_TYPES.map(t => ({ type: t, description: describeWait({ type: t, timeout: DEFAULT_TIMEOUT, selector: '<selector>', fn: '() => true', idle: 'networkidle2' }) }));
}

module.exports = { parseWaitCondition, parseWaitConditions, buildWaitScript, describeWait, listWaitTypes, clampWaitTimeout };
