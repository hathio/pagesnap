// Inject and execute custom JavaScript before taking a screenshot

const MAX_SCRIPT_LENGTH = 10000;

function parseJsAction(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('JS action must be a non-empty string');
  const trimmed = raw.trim();
  if (trimmed.length > MAX_SCRIPT_LENGTH) {
    throw new Error(`JS action exceeds max length of ${MAX_SCRIPT_LENGTH} chars`);
  }
  return { script: trimmed };
}

function parseJsActions(input) {
  if (!input) return [];
  const items = Array.isArray(input) ? input : [input];
  return items.map((item, i) => {
    try {
      return parseJsAction(item);
    } catch (err) {
      throw new Error(`JS action[${i}]: ${err.message}`);
    }
  });
}

function buildJsScript(actions) {
  if (!actions || actions.length === 0) return '';
  const parts = actions.map(({ script }) => {
    return `(async () => { ${script} })();`;
  });
  return parts.join('\n');
}

function describeJsAction(action) {
  const preview = action.script.length > 60
    ? action.script.slice(0, 57) + '...'
    : action.script;
  return `execute: ${preview}`;
}

function buildEvalContext(actions) {
  return {
    scripts: actions.map(a => a.script),
    count: actions.length,
    combined: buildJsScript(actions),
  };
}

module.exports = {
  parseJsAction,
  parseJsActions,
  buildJsScript,
  describeJsAction,
  buildEvalContext,
};
