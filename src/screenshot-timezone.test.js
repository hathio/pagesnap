const { parseTimezone, buildTimezoneContext, buildTimezoneScript, describeTimezone, listPresets } = require('./screenshot-timezone');

describe('parseTimezone', () => {
  test('returns null for falsy input', () => {
    expect(parseTimezone(null)).toBeNull();
    expect(parseTimezone('')).toBeNull();
  });

  test('resolves known preset', () => {
    const tz = parseTimezone('tokyo');
    expect(tz.id).toBe('Asia/Tokyo');
    expect(tz.offset).toBe(540);
    expect(tz.preset).toBe('tokyo');
  });

  test('preset lookup is case-insensitive', () => {
    const tz = parseTimezone('UTC');
    expect(tz.id).toBe('UTC');
  });

  test('accepts valid IANA timezone string', () => {
    const tz = parseTimezone('America/Toronto');
    expect(tz.id).toBe('America/Toronto');
    expect(tz.preset).toBeNull();
  });

  test('throws on unknown timezone', () => {
    expect(() => parseTimezone('Fake/Zone')).toThrow('Unknown timezone');
  });
});

describe('buildTimezoneContext', () => {
  test('returns empty object for null', () => {
    expect(buildTimezoneContext(null)).toEqual({});
  });

  test('returns timezoneId for valid tz', () => {
    const tz = parseTimezone('berlin');
    expect(buildTimezoneContext(tz)).toEqual({ timezoneId: 'Europe/Berlin' });
  });
});

describe('buildTimezoneScript', () => {
  test('returns empty string for null', () => {
    expect(buildTimezoneScript(null)).toBe('');
  });

  test('returns script string containing timezone id', () => {
    const tz = parseTimezone('london');
    const script = buildTimezoneScript(tz);
    expect(script).toContain('Europe/London');
    expect(script).toContain('DateTimeFormat');
  });
});

describe('describeTimezone', () => {
  test('returns fallback string for null', () => {
    expect(describeTimezone(null)).toBe('no timezone override');
  });

  test('includes preset name when available', () => {
    const tz = parseTimezone('sydney');
    const desc = describeTimezone(tz);
    expect(desc).toContain('Australia/Sydney');
    expect(desc).toContain('sydney');
  });

  test('handles IANA-only tz without preset', () => {
    const tz = parseTimezone('Pacific/Auckland');
    const desc = describeTimezone(tz);
    expect(desc).toContain('Pacific/Auckland');
  });
});

describe('listPresets', () => {
  test('returns array of preset objects', () => {
    const presets = listPresets();
    expect(Array.isArray(presets)).toBe(true);
    expect(presets.length).toBeGreaterThan(0);
  });

  test('each preset has required fields', () => {
    listPresets().forEach(p => {
      expect(p).toHaveProperty('key');
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('label');
      expect(p).toHaveProperty('offset');
    });
  });

  test('includes utc preset', () => {
    const keys = listPresets().map(p => p.key);
    expect(keys).toContain('utc');
  });
});
