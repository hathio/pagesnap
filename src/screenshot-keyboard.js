// screenshot-keyboard.js — keyboard event simulation before capture

const VALID_MODIFIERS = ['Alt', 'Control', 'Meta', 'Shift'];
const MAX_DELAY = 5000;

function clampKeyDelay(ms) {
  return Math.max(0, Math.min(ms, MAX_DELAY));
}

function parseKeyAction(raw) {
  if (typeof raw === 'string') {
    raw = { key: raw };
  }
  if (!raw || typeof raw.key !== 'string' || !raw.key.trim()) {
    throw new Error(`Invalid key action: ${JSON.stringify(raw)}`);
  }
  const modifiers = (raw.modifiers || []).map(m => {
    if (!VALID_MODIFIERS.includes(m)) {
      throw new Error(`Unknown modifier: ${m}. Valid: ${VALID_MODIFIERS.join(', ')}`);
    }
    return m;
  });
  return {
    key: raw.key.trim(),
    modifiers,
    delay: clampKeyDelay(Number(raw.delay) || 0),
    type: raw.type === 'up' ? 'up' : raw.type === 'down' ? 'down' : 'press',
  };
}

function parseKeyActions(input) {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [input];
  return list.map(parseKeyAction);
}

function buildKeyboardScript(actions) {
  if (!actions || actions.length === 0) return '';
  const lines = actions.map(a => {
    const modStr = a.modifiers.length ? JSON.stringify(a.modifiers) : 'null';
    const delayLine = a.delay > 0
      ? `  await new Promise(r => setTimeout(r, ${a.delay}));`
      : '';
    if (a.type === 'press') {
      return `${delayLine}\n  await page.keyboard.press(${JSON.stringify(a.key)}, { modifiers: ${modStr} });`;
    } else if (a.type === 'down') {
      return `${delayLine}\n  await page.keyboard.down(${JSON.stringify(a.key)});`;
    } else {
      return `${delayLine}\n  await page.keyboard.up(${JSON.stringify(a.key)});`;
    }
  });
  return lines.join('\n');
}

function describeKeyAction(action) {
  const mods = action.modifiers.length ? `[${action.modifiers.join('+')}] ` : '';
  const delay = action.delay > 0 ? ` (delay: ${action.delay}ms)` : '';
  return `${action.type} ${mods}"${action.key}"${delay}`;
}

function describeKeyboard(actions) {
  if (!actions || actions.length === 0) return 'no keyboard actions';
  return actions.map(describeKeyAction).join(', ');
}

module.exports = {
  clampKeyDelay,
  parseKeyAction,
  parseKeyActions,
  buildKeyboardScript,
  describeKeyboard,
};
