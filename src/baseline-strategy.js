/**
 * Baseline update strategies:
 *   'manual'  — never auto-update (default)
 *   'onPass'  — promote to baseline when diff passes threshold
 *   'always'  — always overwrite baseline after capture
 */

const STRATEGIES = ['manual', 'onPass', 'always'];

function parseStrategy(value) {
  const s = (value || 'manual').toLowerCase();
  if (!STRATEGIES.includes(s)) {
    throw new Error(`Unknown baseline strategy: "${s}". Valid: ${STRATEGIES.join(', ')}`);
  }
  return s;
}

function shouldPromote(strategy, diffResult) {
  if (strategy === 'always') return true;
  if (strategy === 'onPass') {
    return diffResult && diffResult.passed === true;
  }
  return false;
}

function describeStrategy(strategy) {
  const descriptions = {
    manual: 'Baselines are updated manually via CLI.',
    onPass: 'Baselines are promoted automatically when diff passes.',
    always: 'Baselines are always overwritten after each capture.',
  };
  return descriptions[strategy] || 'Unknown strategy.';
}

module.exports = { STRATEGIES, parseStrategy, shouldPromote, describeStrategy };
