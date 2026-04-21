export const ROLLBACK_MODES = ['manual', 'auto', 'none'];

export function parseRollbackStrategy(config = {}) {
  const mode = config.rollbackMode || 'manual';
  if (!ROLLBACK_MODES.includes(mode)) {
    throw new Error(`Unknown rollback mode: "${mode}". Expected one of: ${ROLLBACK_MODES.join(', ')}`);
  }
  const keep = typeof config.rollbackKeep === 'number' ? config.rollbackKeep : 5;
  if (keep < 1) throw new Error('rollbackKeep must be >= 1');
  return { mode, keep };
}

export function shouldAutoSave(strategy, event) {
  if (strategy.mode === 'none') return false;
  if (strategy.mode === 'auto') return true;
  // manual: only save when explicitly triggered
  return event === 'manual';
}

export function describeRollbackStrategy(strategy) {
  const { mode, keep } = strategy;
  if (mode === 'none') return 'Rollback disabled.';
  const trigger = mode === 'auto' ? 'automatically on promote' : 'manually only';
  return `Rollback enabled (${trigger}), keeping last ${keep} point(s).`;
}
