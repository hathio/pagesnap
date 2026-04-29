const {
  clampIframeTimeout,
  parseIframeOptions,
  resolveIframeSelector,
  buildIframeScript,
  describeIframe,
} = require('./screenshot-iframe');

describe('clampIframeTimeout', () => {
  test('returns default for non-number', () => {
    expect(clampIframeTimeout(undefined)).toBe(3000);
    expect(clampIframeTimeout('fast')).toBe(3000);
  });
  test('clamps to min 500', () => expect(clampIframeTimeout(100)).toBe(500));
  test('clamps to max 30000', () => expect(clampIframeTimeout(99999)).toBe(30000));
  test('passes valid value through', () => expect(clampIframeTimeout(5000)).toBe(5000));
});

describe('parseIframeOptions', () => {
  test('returns null for empty input', () => {
    expect(parseIframeOptions({})).toBeNull();
    expect(parseIframeOptions(null)).toBeNull();
  });
  test('parses selector', () => {
    const r = parseIframeOptions({ selector: '#my-frame' });
    expect(r.selector).toBe('#my-frame');
    expect(r.waitForLoad).toBe(true);
    expect(r.scrollIntoView).toBe(true);
  });
  test('parses name and src', () => {
    const r = parseIframeOptions({ name: 'content', src: 'embed' });
    expect(r.name).toBe('content');
    expect(r.src).toBe('embed');
  });
  test('parses index', () => {
    const r = parseIframeOptions({ index: 2 });
    expect(r.index).toBe(2);
  });
  test('respects waitForLoad false', () => {
    const r = parseIframeOptions({ selector: 'iframe', waitForLoad: false });
    expect(r.waitForLoad).toBe(false);
  });
  test('uses timeout alias', () => {
    const r = parseIframeOptions({ selector: 'iframe', timeout: 8000 });
    expect(r.waitTimeout).toBe(8000);
  });
});

describe('resolveIframeSelector', () => {
  test('returns null for null opts', () => expect(resolveIframeSelector(null)).toBeNull());
  test('prefers explicit selector', () => {
    expect(resolveIframeSelector({ selector: '#f', name: 'x', index: 0 })).toBe('#f');
  });
  test('builds name selector', () => {
    expect(resolveIframeSelector({ selector: null, name: 'main', src: null, index: null })).toBe('iframe[name="main"]');
  });
  test('builds src selector', () => {
    expect(resolveIframeSelector({ selector: null, name: null, src: 'youtube', index: null })).toBe('iframe[src*="youtube"]');
  });
  test('builds nth-of-type for index', () => {
    expect(resolveIframeSelector({ selector: null, name: null, src: null, index: 1 })).toBe('iframe:nth-of-type(2)');
  });
});

describe('buildIframeScript', () => {
  test('returns empty string for null', () => expect(buildIframeScript(null)).toBe(''));
  test('includes scrollIntoView when enabled', () => {
    const opts = parseIframeOptions({ selector: 'iframe', scrollIntoView: true, waitForLoad: false });
    const script = buildIframeScript(opts);
    expect(script).toContain('scrollIntoView');
  });
  test('includes load wait when waitForLoad true', () => {
    const opts = parseIframeOptions({ selector: '#frame', waitForLoad: true, scrollIntoView: false });
    const script = buildIframeScript(opts);
    expect(script).toContain('contentDocument');
    expect(script).toContain('iframe load timeout');
  });
});

describe('describeIframe', () => {
  test('returns fallback for null', () => expect(describeIframe(null)).toBe('no iframe targeting'));
  test('describes options', () => {
    const opts = parseIframeOptions({ name: 'main', waitTimeout: 5000 });
    const desc = describeIframe(opts);
    expect(desc).toContain('main');
    expect(desc).toContain('5000ms');
  });
});
