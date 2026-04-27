const { parseAuthOptions, buildAuthHeaders, describeAuth, SUPPORTED_TYPES } = require('./screenshot-auth');

test('returns none for empty input', () => {
  expect(parseAuthOptions()).toEqual({ type: 'none' });
  expect(parseAuthOptions({})).toEqual({ type: 'none' });
  expect(parseAuthOptions({ type: 'none' })).toEqual({ type: 'none' });
});

test('parses basic auth', () => {
  const result = parseAuthOptions({ type: 'basic', username: 'alice', password: 'secret' });
  expect(result).toEqual({ type: 'basic', username: 'alice', password: 'secret' });
});

test('throws for basic auth missing credentials', () => {
  expect(() => parseAuthOptions({ type: 'basic', username: 'alice' })).toThrow('username and password');
  expect(() => parseAuthOptions({ type: 'basic', password: 'x' })).toThrow('username and password');
});

test('parses bearer auth', () => {
  const result = parseAuthOptions({ type: 'bearer', token: 'abc123' });
  expect(result).toEqual({ type: 'bearer', token: 'abc123' });
});

test('throws for bearer auth missing token', () => {
  expect(() => parseAuthOptions({ type: 'bearer' })).toThrow('token');
});

test('parses header auth', () => {
  const result = parseAuthOptions({ type: 'header', name: 'X-Api-Key', value: 'mykey' });
  expect(result).toEqual({ type: 'header', name: 'X-Api-Key', value: 'mykey' });
});

test('throws for unknown auth type', () => {
  expect(() => parseAuthOptions({ type: 'oauth' })).toThrow('Unknown auth type');
});

test('buildAuthHeaders returns empty for none', () => {
  expect(buildAuthHeaders({ type: 'none' })).toEqual({});
  expect(buildAuthHeaders(null)).toEqual({});
});

test('buildAuthHeaders builds basic Authorization header', () => {
  const headers = buildAuthHeaders({ type: 'basic', username: 'bob', password: 'pass' });
  const expected = 'Basic ' + Buffer.from('bob:pass').toString('base64');
  expect(headers).toEqual({ Authorization: expected });
});

test('buildAuthHeaders builds bearer Authorization header', () => {
  const headers = buildAuthHeaders({ type: 'bearer', token: 'tok' });
  expect(headers).toEqual({ Authorization: 'Bearer tok' });
});

test('buildAuthHeaders builds custom header', () => {
  const headers = buildAuthHeaders({ type: 'header', name: 'X-Token', value: '42' });
  expect(headers).toEqual({ 'X-Token': '42' });
});

test('describeAuth returns readable strings', () => {
  expect(describeAuth({ type: 'none' })).toBe('no authentication');
  expect(describeAuth({ type: 'basic', username: 'alice' })).toContain('alice');
  expect(describeAuth({ type: 'bearer', token: 'abcdefghijklmn' })).toContain('abcdefgh');
  expect(describeAuth({ type: 'header', name: 'X-Api-Key' })).toContain('X-Api-Key');
});

test('SUPPORTED_TYPES lists expected values', () => {
  expect(SUPPORTED_TYPES).toContain('basic');
  expect(SUPPORTED_TYPES).toContain('bearer');
  expect(SUPPORTED_TYPES).toContain('header');
});
