const path = require('path');
const { getStorageRoot } = require('./storage');

const STRATEGIES = ['flat', 'dated', 'nested'];

function parseStorageStrategy(name = 'flat') {
  if (!STRATEGIES.includes(name)) {
    throw new Error(`Unknown storage strategy: ${name}. Valid: ${STRATEGIES.join(', ')}`);
  }
  return name;
}

function resolveStoragePath(strategy, label, filename) {
  const root = getStorageRoot();
  switch (strategy) {
    case 'dated': {
      const date = new Date().toISOString().slice(0, 10);
      return path.join(root, date, label, filename);
    }
    case 'nested':
      return path.join(root, label, filename);
    case 'flat':
    default:
      return path.join(root, `${label}__${filename}`);
  }
}

function describeStorageStrategy(strategy) {
  const descriptions = {
    flat: 'All files in one directory, prefixed by label.',
    dated: 'Files grouped by date, then label.',
    nested: 'Files grouped by label in subdirectories.',
  };
  return descriptions[strategy] || 'Unknown strategy.';
}

module.exports = {
  STRATEGIES,
  parseStorageStrategy,
  resolveStoragePath,
  describeStorageStrategy,
};
