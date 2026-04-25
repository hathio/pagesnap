const { parseCookie, parseCookies, validateCookie, buildCookieScript, describeCookie } = require('./screenshot-cookie');

describe('parseCookie', () => {
  it('parses a simple name=value string', () => {
    expect(parseCookie('session=abc123')).toEqual({ name: 'session', value: 'abc123' });
  });

  it('preserves = signs in value', () => {
    const c = parseCookie('token=a=b=c');
    expect(c.value).toBe('a=b=c');
  });

  it('passes through cookie objects', () => {
    const obj = { name: 'auth', value: 'xyz', secure: true };
    expect(parseCookie(obj)).toMatchObject(obj);
  });

  it('throws on empty string', () => {
    expect(() => parseCookie('')).toThrow();
  });

  it('throws on unsupported type', () => {
    expect(() => parseCookie(42)).toThrow();
  });
});

describe('parseCookies', () => {
  it('returns empty array for falsy input', () => {
    expect(parseCookies(null)).toEqual([]);
    expect(parseCookies(undefined)).toEqual([]);
  });

  it('wraps single item in array', () => {
    expect(parseCookies('a=1')).toHaveLength(1);
  });

  it('parses array of cookies', () => {
    const result = parseCookies(['a=1', 'b=2']);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('a');
  });
});

describe('validateCookie', () => {
  it('returns no errors for valid cookie', () => {
    expect(validateCookie({ name: 'x', value: 'y' })).toEqual([]);
  });

  it('errors on missing name', () => {
    expect(validateCookie({ value: 'y' }).length).toBeGreaterThan(0);
  });

  it('errors on invalid sameSite', () => {
    const errs = validateCookie({ name: 'x', sameSite: 'invalid' });
    expect(errs.some(e => e.includes('sameSite'))).toBe(true);
  });

  it('errors on non-numeric expires', () => {
    const errs = validateCookie({ name: 'x', expires: 'tomorrow' });
    expect(errs.some(e => e.includes('expires'))).toBe(true);
  });
});

describe('buildCookieScript', () => {
  it('returns empty string for no cookies', () => {
    expect(buildCookieScript([])).toBe('');
    expect(buildCookieScript(null)).toBe('');
  });

  it('returns a non-empty script for cookies', () => {
    const script = buildCookieScript([{ name: 'a', value: '1' }]);
    expect(typeof script).toBe('string');
    expect(script.length).toBeGreaterThan(0);
  });
});

describe('describeCookie', () => {
  it('includes name and value', () => {
    const desc = describeCookie({ name: 'session', value: 'tok' });
    expect(desc).toContain('name=session');
    expect(desc).toContain('value=tok');
  });

  it('includes optional fields when present', () => {
    const desc = describeCookie({ name: 'x', value: 'y', secure: true, sameSite: 'Lax' });
    expect(desc).toContain('secure');
    expect(desc).toContain('sameSite=Lax');
  });
});
