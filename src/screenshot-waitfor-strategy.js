// Strategy helpers for wait-for configuration

const { parseWaitConditions, describeWait } = require('./screenshot-waitfor');

const STRATEGY_PRESETS = {
  fast: [],
  default: [{ type: 'network', idle: 'networkidle2', timeout: 5000 }],
  thorough: [
    { type: 'network', idle: 'networkidle0', timeout: 10000 },
    { type: 'timeout', timeout: 500 }
  ],
  spa: [
    { type: 'network', idle: 'networkidle2', timeout: 8000 },
    { type: 'selector', selector: '[data-ready]', timeout: 5000 }
  ]
};

function parseWaitStrategy(name) {
  if (!name || name === 'none' || name === 'fast') return { name: 'fast', conditions: [] };
  if (STRATEGY_PRESETS[name]) {
    return { name, conditions: parseWaitConditions(STRATEGY_PRESETS[name]) };
  }
  throw new Error(`Unknown wait strategy: ${name}. Available: ${Object.keys(STRATEGY_PRESETS).join(', ')}`);
}

function mergeWaitConditions(strategy, extra) {
  const base = strategy ? strategy.conditions : [];
  const additional = parseWaitConditions(extra || []);
  return [...base, ...additional];
}

function describeWaitStrategy(strategy) {
  if (!strategy || strategy.conditions.length === 0) return 'no wait conditions';
  const lines = strategy.conditions.map(c => `  - ${describeWait(c)}`);
  return `strategy "${strategy.name}":\n${lines.join('\n')}`;
}

function listStrategyPresets() {
  return Object.keys(STRATEGY_PRESETS).map(name => ({
    name,
    count: STRATEGY_PRESETS[name].length,
    description: name === 'fast' ? 'no waiting' : `${STRATEGY_PRESETS[name].length} condition(s)`
  }));
}

module.exports = { parseWaitStrategy, mergeWaitConditions, describeWaitStrategy, listStrategyPresets, STRATEGY_PRESETS };
