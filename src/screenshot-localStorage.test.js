const {
  parseLocalStorageEntry,
  parseLocalStorageEntries,
  buildLocalStorageScript,
  describeLocalStorage,
} = require('./screenshot-localStorage');

describe('parseLocalStorageEntry', () => {
  test('parses simple key=value', () => {
    expect(parseLocalStorageEntry('theme=dark')).toEqual({ key: 'theme', value: 'dark' });
  });

  test('value may contain = signs', () => {
    expect(parseLocalStorageEntry('token=abc=def==')).toEqual({ key: 'token', value: 'abc=def==' });
  });

  test('throws when no = present', () => {
    expect(() => parseLocalStorageEntry('badentry')).toThrow('Invalid localStorage entry');
  });

  test('throws when key is empty', () => {
    expect(() => parseLocalStorageEntry('=value')).toThrow('key must not be empty');
  });
});

describe('parseLocalStorageEntries', () => {
  test('returns empty array for empty input', () => {
    expect(parseLocalStorageEntries([])).toEqual([]);
  });

  test('parses multiple entries', () => {
    const result = parseLocalStorageEntries(['a=1', 'b=2']);
    expect(result).toEqual([{ key: 'a', value: '1' }, { key: 'b', value: '2' }]);
  });

  test('returns empty array for non-array', () => {
    expect(parseLocalStorageEntries(null)).toEqual([]);
  });
});

describe('buildLocalStorageScript', () => {
  test('returns empty string for no entries', () => {
    expect(buildLocalStorageScript([])).toBe('');
  });

  test('script contains setItem calls', () => {
    const script = buildLocalStorageScript([{ key: 'theme', value: 'dark' }]);
    expect(script).toContain('localStorage.setItem');
    expect(script).toContain('"theme"');
    expect(script).toContain('"dark"');
  });

  test('wraps in IIFE', () => {
    const script = buildLocalStorageScript([{ key: 'x', value: '1' }]);
    expect(script).toMatch(/^\(function/);
    expect(script).toMatch(/\}\)\(\);$/);
  });

  test('includes all entries', () => {
    const script = buildLocalStorageScript([
      { key: 'a', value: '1' },
      { key: 'b', value: '2' },
    ]);
    expect(script).toContain('"a"');
    expect(script).toContain('"b"');
  });
});

describe('describeLocalStorage', () => {
  test('returns none for empty entries', () => {
    expect(describeLocalStorage([])).toBe('localStorage: none');
  });

  test('includes count and keys', () => {
    const desc = describeLocalStorage([{ key: 'theme', value: 'dark' }]);
    expect(desc).toContain('localStorage (1)');
    expect(desc).toContain('theme=dark');
  });

  test('truncates long values', () => {
    const longVal = 'x'.repeat(60);
    const desc = describeLocalStorage([{ key: 'k', value: longVal }]);
    expect(desc).toContain('...');
  });
});
