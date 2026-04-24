const { parseFocusOptions, buildFocusScript, describeFocus, VALID_STRATEGIES } = require('./screenshot-focus');

describe('parseFocusOptions', () => {
  test('returns defaults when called with empty object', () => {
    const opts = parseFocusOptions({});
    expect(opts.selector).toBeNull();
    expect(opts.strategy).toBe('css');
    expect(opts.timeout).toBe(5000);
    expect(opts.scrollIntoView).toBe(true);
    expect(opts.highlightColor).toBeNull();
  });

  test('accepts valid strategies', () => {
    for (const s of VALID_STRATEGIES) {
      expect(() => parseFocusOptions({ strategy: s })).not.toThrow();
    }
  });

  test('throws on unknown strategy', () => {
    expect(() => parseFocusOptions({ strategy: 'hover' })).toThrow(/Unknown focus strategy/);
  });

  test('throws on negative timeout', () => {
    expect(() => parseFocusOptions({ timeout: -1 })).toThrow(/timeout must be/);
  });

  test('accepts zero timeout', () => {
    const opts = parseFocusOptions({ timeout: 0 });
    expect(opts.timeout).toBe(0);
  });
});

describe('buildFocusScript', () => {
  test('returns null when no selector', () => {
    const opts = parseFocusOptions({});
    expect(buildFocusScript(opts)).toBeNull();
  });

  test('css selector uses querySelector', () => {
    const opts = parseFocusOptions({ selector: '.hero', strategy: 'css' });
    const script = buildFocusScript(opts);
    expect(script).toContain('querySelector');
    expect(script).toContain('.hero');
  });

  test('xpath selector uses document.evaluate', () => {
    const opts = parseFocusOptions({ selector: '//h1', strategy: 'xpath' });
    const script = buildFocusScript(opts);
    expect(script).toContain('document.evaluate');
  });

  test('text strategy uses textContent match', () => {
    const opts = parseFocusOptions({ selector: 'Submit', strategy: 'text' });
    const script = buildFocusScript(opts);
    expect(script).toContain('textContent');
  });

  test('includes scrollIntoView when enabled', () => {
    const opts = parseFocusOptions({ selector: '#nav', scrollIntoView: true });
    expect(buildFocusScript(opts)).toContain('scrollIntoView');
  });

  test('includes highlight outline when color provided', () => {
    const opts = parseFocusOptions({ selector: '#btn', highlightColor: 'red' });
    expect(buildFocusScript(opts)).toContain('outline');
    expect(buildFocusScript(opts)).toContain('red');
  });
});

describe('describeFocus', () => {
  test('returns no-selector message when selector is null', () => {
    expect(describeFocus(parseFocusOptions({}))).toBe('no focus selector');
  });

  test('includes selector and strategy in description', () => {
    const desc = describeFocus(parseFocusOptions({ selector: '.cta', strategy: 'css' }));
    expect(desc).toContain('.cta');
    expect(desc).toContain('css');
  });

  test('mentions highlight color when set', () => {
    const desc = describeFocus(parseFocusOptions({ selector: 'h1', highlightColor: 'blue' }));
    expect(desc).toContain('blue');
  });
});
