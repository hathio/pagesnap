const {
  clampKeyDelay,
  parseKeyAction,
  parseKeyActions,
  buildKeyboardScript,
  describeKeyboard,
} = require('./screenshot-keyboard');

describe('clampKeyDelay', () => {
  it('clamps to 0 minimum', () => expect(clampKeyDelay(-100)).toBe(0));
  it('clamps to 5000 maximum', () => expect(clampKeyDelay(9999)).toBe(5000));
  it('passes through valid values', () => expect(clampKeyDelay(200)).toBe(200));
});

describe('parseKeyAction', () => {
  it('accepts a plain string shorthand', () => {
    const a = parseKeyAction('Enter');
    expect(a.key).toBe('Enter');
    expect(a.type).toBe('press');
    expect(a.modifiers).toEqual([]);
    expect(a.delay).toBe(0);
  });

  it('parses modifiers', () => {
    const a = parseKeyAction({ key: 'a', modifiers: ['Control', 'Shift'] });
    expect(a.modifiers).toEqual(['Control', 'Shift']);
  });

  it('throws on unknown modifier', () => {
    expect(() => parseKeyAction({ key: 'a', modifiers: ['Win'] })).toThrow('Unknown modifier');
  });

  it('throws on missing key', () => {
    expect(() => parseKeyAction({ key: '' })).toThrow('Invalid key action');
  });

  it('normalises type to press/up/down', () => {
    expect(parseKeyAction({ key: 'Tab', type: 'down' }).type).toBe('down');
    expect(parseKeyAction({ key: 'Tab', type: 'up' }).type).toBe('up');
    expect(parseKeyAction({ key: 'Tab', type: 'whatever' }).type).toBe('press');
  });
});

describe('parseKeyActions', () => {
  it('returns empty array for falsy input', () => expect(parseKeyActions(null)).toEqual([]));
  it('wraps single action in array', () => {
    const result = parseKeyActions('Escape');
    expect(result).toHaveLength(1);
  });
  it('handles array input', () => {
    const result = parseKeyActions(['Tab', 'Enter']);
    expect(result).toHaveLength(2);
  });
});

describe('buildKeyboardScript', () => {
  it('returns empty string for no actions', () => {
    expect(buildKeyboardScript([])).toBe('');
  });

  it('includes press call', () => {
    const script = buildKeyboardScript([parseKeyAction('Enter')]);
    expect(script).toContain('keyboard.press');
    expect(script).toContain('"Enter"');
  });

  it('includes delay line when delay > 0', () => {
    const script = buildKeyboardScript([parseKeyAction({ key: 'Tab', delay: 100 })]);
    expect(script).toContain('setTimeout');
  });

  it('uses keyboard.down for down type', () => {
    const script = buildKeyboardScript([parseKeyAction({ key: 'Shift', type: 'down' })]);
    expect(script).toContain('keyboard.down');
  });
});

describe('describeKeyboard', () => {
  it('returns readable string for no actions', () => {
    expect(describeKeyboard([])).toBe('no keyboard actions');
  });

  it('describes actions with modifiers', () => {
    const actions = parseKeyActions({ key: 'a', modifiers: ['Control'] });
    const desc = describeKeyboard(actions);
    expect(desc).toContain('Control');
    expect(desc).toContain('"a"');
  });
});
