const { redactUrl, redactObject, buildRedactOptions, REDACTED } = require('./redact');

describe('redactUrl', () => {
  test('redacts token query param', () => {
    const url = 'https://example.com/page?token=abc123&foo=bar';
    expect(redactUrl(url)).toBe('https://example.com/page?token=[REDACTED]&foo=bar');
  });

  test('redacts api_key query param', () => {
    const url = 'https://example.com/?api_key=supersecret';
    expect(redactUrl(url)).toContain('[REDACTED]');
    expect(redactUrl(url)).not.toContain('supersecret');
  });

  test('redacts Bearer token in URL', () => {
    const url = 'https://example.com/?auth=Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig';
    expect(redactUrl(url)).toContain('[REDACTED]');
  });

  test('leaves unrelated params untouched', () => {
    const url = 'https://example.com/?page=2&sort=asc';
    expect(redactUrl(url)).toBe(url);
  });

  test('handles extra custom patterns', () => {
    const url = 'https://example.com/?custom_id=12345';
    const pattern = /([?&])(custom_id)=([^&]*)/gi;
    expect(redactUrl(url, [pattern])).toContain('[REDACTED]');
  });

  test('returns non-string input as-is', () => {
    expect(redactUrl(null)).toBeNull();
    expect(redactUrl(42)).toBe(42);
  });
});

describe('redactObject', () => {
  test('redacts known sensitive keys', () => {
    const obj = { username: 'alice', password: 'hunter2', age: 30 };
    const result = redactObject(obj);
    expect(result.password).toBe(REDACTED);
    expect(result.username).toBe('alice');
    expect(result.age).toBe(30);
  });

  test('redacts nested sensitive keys', () => {
    const obj = { user: { token: 'abc', name: 'bob' } };
    const result = redactObject(obj);
    expect(result.user.token).toBe(REDACTED);
    expect(result.user.name).toBe('bob');
  });

  test('handles arrays', () => {
    const arr = [{ secret: 'x' }, { value: 1 }];
    const result = redactObject(arr);
    expect(result[0].secret).toBe(REDACTED);
    expect(result[1].value).toBe(1);
  });

  test('redacts extra custom keys', () => {
    const obj = { sessionId: 'sess_abc', data: 'ok' };
    const result = redactObject(obj, ['sessionId']);
    expect(result.sessionId).toBe(REDACTED);
    expect(result.data).toBe('ok');
  });

  test('returns primitives unchanged', () => {
    expect(redactObject('hello')).toBe('hello');
    expect(redactObject(123)).toBe(123);
    expect(redactObject(null)).toBeNull();
  });
});

describe('buildRedactOptions', () => {
  test('returns defaults for empty config', () => {
    const opts = buildRedactOptions({});
    expect(opts.extraPatterns).toEqual([]);
    expect(opts.sensitiveKeys).toEqual([]);
  });

  test('parses pattern strings into RegExp', () => {
    const config = { redact: { patterns: ['my_token=[^&]*'] } };
    const opts = buildRedactOptions(config);
    expect(opts.extraPatterns).toHaveLength(1);
    expect(opts.extraPatterns[0]).toBeInstanceOf(RegExp);
  });

  test('passes through sensitive keys', () => {
    const config = { redact: { keys: ['sessionId', 'csrfToken'] } };
    const opts = buildRedactOptions(config);
    expect(opts.sensitiveKeys).toEqual(['sessionId', 'csrfToken']);
  });
});
