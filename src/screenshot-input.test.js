const { parseInputAction, parseInputActions, buildInputScript, describeInput } = require('./screenshot-input');

describe('parseInputAction', () => {
  test('parses a basic text action', () => {
    const a = parseInputAction({ selector: '#name', type: 'text', value: 'Alice' });
    expect(a).toEqual({ selector: '#name', type: 'text', value: 'Alice' });
  });

  test('defaults type to text', () => {
    const a = parseInputAction({ selector: '#q', value: 'hello' });
    expect(a.type).toBe('text');
  });

  test('throws on missing selector', () => {
    expect(() => parseInputAction({ type: 'text', value: 'x' })).toThrow('selector');
  });

  test('throws on unknown type', () => {
    expect(() => parseInputAction({ selector: '#x', type: 'drag' })).toThrow('Unknown input type');
  });

  test('parses clear action without value', () => {
    const a = parseInputAction({ selector: '#field', type: 'clear' });
    expect(a.type).toBe('clear');
  });

  test('parses select action', () => {
    const a = parseInputAction({ selector: 'select#lang', type: 'select', value: 'en' });
    expect(a.value).toBe('en');
  });
});

describe('parseInputActions', () => {
  test('returns empty array for null', () => {
    expect(parseInputActions(null)).toEqual([]);
  });

  test('wraps single object in array', () => {
    const result = parseInputActions({ selector: '#a', type: 'text', value: 'hi' });
    expect(result).toHaveLength(1);
  });

  test('annotates error with index', () => {
    expect(() => parseInputActions([{ selector: '#ok', type: 'text' }, { type: 'text' }])).toThrow('action[1]');
  });
});

describe('buildInputScript', () => {
  test('returns empty string for no actions', () => {
    expect(buildInputScript([])).toBe('');
  });

  test('generates page.type for text', () => {
    const script = buildInputScript([{ selector: '#q', type: 'text', value: 'test' }]);
    expect(script).toContain('page.type');
    expect(script).toContain('#q');
  });

  test('generates page.select for select', () => {
    const script = buildInputScript([{ selector: 'select', type: 'select', value: 'opt1' }]);
    expect(script).toContain('page.select');
  });

  test('generates evaluate for clear', () => {
    const script = buildInputScript([{ selector: '#f', type: 'clear', value: '' }]);
    expect(script).toContain('page.evaluate');
    expect(script).toContain("el.value = ''");
  });
});

describe('describeInput', () => {
  test('returns no input actions for empty', () => {
    expect(describeInput([])).toBe('no input actions');
  });

  test('describes actions', () => {
    const desc = describeInput([{ selector: '#q', type: 'text', value: 'hi' }]);
    expect(desc).toContain('text(#q=hi)');
  });
});
