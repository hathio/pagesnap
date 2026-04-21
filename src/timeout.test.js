const {
  parseTimeoutOptions,
  applyTimeouts,
  describeTimeout,
  buildTimeoutSummary,
  DEFAULT_NAVIGATION_TIMEOUT,
  DEFAULT_WAIT_TIMEOUT,
} = require('./timeout');

describe('parseTimeoutOptions', () => {
  test('returns defaults when called with no args', () => {
    const result = parseTimeoutOptions();
    expect(result.navigation).toBe(DEFAULT_NAVIGATION_TIMEOUT);
    expect(result.wait).toBe(DEFAULT_WAIT_TIMEOUT);
  });

  test('parses custom values', () => {
    const result = parseTimeoutOptions({ navigationTimeout: 10000, waitTimeout: 2000 });
    expect(result.navigation).toBe(10000);
    expect(result.wait).toBe(2000);
  });

  test('clamps values below minimum', () => {
    const result = parseTimeoutOptions({ navigationTimeout: 10, waitTimeout: 0 });
    expect(result.navigation).toBe(500);
    expect(result.wait).toBe(500);
  });

  test('clamps values above maximum', () => {
    const result = parseTimeoutOptions({ navigationTimeout: 999999, waitTimeout: 999999 });
    expect(result.navigation).toBe(120000);
    expect(result.wait).toBe(120000);
  });

  test('throws on non-numeric navigationTimeout', () => {
    expect(() => parseTimeoutOptions({ navigationTimeout: 'bad' })).toThrow('Invalid navigationTimeout');
  });

  test('throws on non-numeric waitTimeout', () => {
    expect(() => parseTimeoutOptions({ waitTimeout: 'nope' })).toThrow('Invalid waitTimeout');
  });
});

describe('applyTimeouts', () => {
  test('calls page setters with parsed values', () => {
    const page = {
      setDefaultNavigationTimeout: jest.fn(),
      setDefaultTimeout: jest.fn(),
    };
    const result = applyTimeouts(page, { navigationTimeout: 15000, waitTimeout: 3000 });
    expect(page.setDefaultNavigationTimeout).toHaveBeenCalledWith(15000);
    expect(page.setDefaultTimeout).toHaveBeenCalledWith(3000);
    expect(result).toEqual({ navigation: 15000, wait: 3000 });
  });
});

describe('describeTimeout', () => {
  test('returns human readable string', () => {
    const desc = describeTimeout({ navigationTimeout: 20000, waitTimeout: 4000 });
    expect(desc).toBe('navigation=20000ms, wait=4000ms');
  });
});

describe('buildTimeoutSummary', () => {
  test('marks defaults as isDefault=true', () => {
    const summary = buildTimeoutSummary();
    expect(summary.isDefault).toBe(true);
  });

  test('marks custom values as isDefault=false', () => {
    const summary = buildTimeoutSummary({ navigationTimeout: 10000 });
    expect(summary.isDefault).toBe(false);
  });
});
