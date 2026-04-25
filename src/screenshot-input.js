// screenshot-input.js — simulate keyboard/form input before capture

const VALID_INPUT_TYPES = ['text', 'select', 'checkbox', 'radio', 'clear'];

function parseInputAction(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Input action must be an object');
  const { selector, type = 'text', value = '' } = raw;
  if (!selector || typeof selector !== 'string') throw new Error('Input action requires a selector string');
  if (!VALID_INPUT_TYPES.includes(type)) {
    throw new Error(`Unknown input type "${type}". Valid: ${VALID_INPUT_TYPES.join(', ')}`);
  }
  if (type !== 'clear' && type !== 'checkbox' && type !== 'radio' && typeof value !== 'string') {
    throw new Error('Input value must be a string');
  }
  return { selector, type, value: String(value) };
}

function parseInputActions(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((item, i) => {
    try {
      return parseInputAction(item);
    } catch (e) {
      throw new Error(`Input action[${i}]: ${e.message}`);
    }
  });
}

function buildInputScript(actions) {
  if (!actions || actions.length === 0) return '';
  const steps = actions.map(({ selector, type, value }) => {
    const sel = JSON.stringify(selector);
    const val = JSON.stringify(value);
    switch (type) {
      case 'text':
        return `await page.focus(${sel}); await page.evaluate(s => { document.querySelector(s).value = ''; }, ${sel}); await page.type(${sel}, ${val});`;
      case 'clear':
        return `await page.evaluate(s => { const el = document.querySelector(s); if (el) el.value = ''; }, ${sel});`;
      case 'select':
        return `await page.select(${sel}, ${val});`;
      case 'checkbox':
      case 'radio':
        return `await page.evaluate((s, v) => { const el = document.querySelector(s); if (el) el.checked = v === 'true' || v === '1' || v === 'on'; }, ${sel}, ${val});`;
      default:
        return '';
    }
  });
  return steps.filter(Boolean).join('\n');
}

function describeInput(actions) {
  if (!actions || actions.length === 0) return 'no input actions';
  return actions.map(a => `${a.type}(${a.selector}${a.value ? '=' + a.value : ''})`).join(', ');
}

module.exports = { parseInputAction, parseInputActions, buildInputScript, describeInput, VALID_INPUT_TYPES };
