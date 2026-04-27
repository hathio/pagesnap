const { parseDarkMode, buildDarkModeContext, describeDarkMode, listSchemes } = require('./screenshot-darkmode');

describe('parseDarkMode', () => {
  test('true maps to dark', () => {
    expect(parseDarkMode(true)).toEqual({ scheme: 'dark' });
  });

  test('false maps to light', () => {
    expect(parseDarkMode(false)).toEqual({ scheme: 'light' });
  });

  test('string "dark"', () => {
    expect(parseDarkMode('dark')).toEqual({ scheme: 'dark' });
  });

  test('string "light"', () => {
    expect(parseDarkMode('light')).toEqual({ scheme: 'light' });
  });

  test('string "no-preference"', () => {
    expect(parseDarkMode('no-preference')).toEqual({ scheme: 'no-preference' });
  });

  test('case insensitive', () => {
    expect(parseDarkMode('Dark')).toEqual({ scheme: 'dark' });
    expect(parseDarkMode('LIGHT')).toEqual({ scheme: 'light' });
  });

  test('throws on invalid value', () => {
    expect(() => parseDarkMode('rainbow')).toThrow(/Invalid color scheme/);
    expect(() => parseDarkMode('rainbow')).toThrow(/light, dark/);
  });
});

describe('buildDarkModeContext', () => {
  test('returns colorScheme property', () => {
    expect(buildDarkModeContext({ scheme: 'dark' })).toEqual({ colorScheme: 'dark' });
    expect(buildDarkModeContext({ scheme: 'light' })).toEqual({ colorScheme: 'light' });
  });
});

describe('describeDarkMode', () => {
  test('dark description', () => {
    expect(describeDarkMode({ scheme: 'dark' })).toBe('Dark mode enabled');
  });

  test('light description', () => {
    expect(describeDarkMode({ scheme: 'light' })).toBe('Light mode (forced)');
  });

  test('no-preference description', () => {
    expect(describeDarkMode({ scheme: 'no-preference' })).toBe('No color scheme preference');
  });

  test('fallback for unknown', () => {
    expect(describeDarkMode({ scheme: 'custom' })).toBe('Color scheme: custom');
  });
});

describe('listSchemes', () => {
  test('returns all valid schemes', () => {
    const schemes = listSchemes();
    expect(schemes).toContain('dark');
    expect(schemes).toContain('light');
    expect(schemes).toContain('no-preference');
    expect(schemes).toHaveLength(3);
  });

  test('returns a copy, not the original array', () => {
    const a = listSchemes();
    const b = listSchemes();
    expect(a).not.toBe(b);
  });
});
