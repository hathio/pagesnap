const {
  parseHeader,
  parseHeaders,
  buildHeadersMap,
  mergeHeaders,
  redactSensitiveHeaders,
  describeHeaders,
  applyHeadersToPage,
} = require('./screenshot-headers');

test('parseHeader splits name and value', () => {
  expect(parseHeader('X-Custom: hello')).toEqual({ name: 'X-Custom', value: 'hello' });
});

test('parseHeader handles value with colons', () => {
  expect(parseHeader('Authorization: Bearer tok:en')).toEqual({
    name: 'Authorization',
    value: 'Bearer tok:en',
  });
});

test('parseHeader throws on missing colon', () => {
  expect(() => parseHeader('BadHeader')).toThrow('Invalid header format');
});

test('parseHeader throws on empty name', () => {
  expect(() => parseHeader(': value')).toThrow('Header name cannot be empty');
});

test('parseHeaders accepts array', () => {
  const result = parseHeaders(['X-A: 1', 'X-B: 2']);
  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({ name: 'X-A', value: '1' });
});

test('parseHeaders accepts single string', () => {
  const result = parseHeaders('X-A: 1');
  expect(result).toHaveLength(1);
});

test('parseHeaders returns empty array for falsy input', () => {
  expect(parseHeaders(null)).toEqual([]);
});

test('buildHeadersMap converts array to object', () => {
  const map = buildHeadersMap([{ name: 'X-A', value: '1' }, { name: 'X-B', value: '2' }]);
  expect(map).toEqual({ 'X-A': '1', 'X-B': '2' });
});

test('mergeHeaders merges multiple sources', () => {
  const a = { 'X-A': '1' };
  const b = [{ name: 'X-B', value: '2' }];
  const result = mergeHeaders(a, b);
  expect(result['X-A']).toBe('1');
  expect(result['X-B']).toBe('2');
});

test('mergeHeaders later values overwrite earlier', () => {
  const result = mergeHeaders({ 'X-A': 'old' }, { 'X-A': 'new' });
  expect(result['X-A']).toBe('new');
});

test('redactSensitiveHeaders redacts known keys', () => {
  const out = redactSensitiveHeaders({ Authorization: 'secret', 'X-Custom': 'ok' });
  expect(out['Authorization']).toBe('[REDACTED]');
  expect(out['X-Custom']).toBe('ok');
});

test('describeHeaders returns readable string', () => {
  const desc = describeHeaders({ 'X-A': '1', 'X-B': '2' });
  expect(desc).toContain('X-A: 1');
});

test('describeHeaders returns fallback for empty', () => {
  expect(describeHeaders({})).toBe('no custom headers');
});

test('applyHeadersToPage calls setExtraHTTPHeaders', async () => {
  const page = { setExtraHTTPHeaders: jest.fn().mockResolvedValue() };
  await applyHeadersToPage(page, { 'X-Test': 'yes' });
  expect(page.setExtraHTTPHeaders).toHaveBeenCalledWith({ 'X-Test': 'yes' });
});

test('applyHeadersToPage skips call for empty headers', async () => {
  const page = { setExtraHTTPHeaders: jest.fn() };
  await applyHeadersToPage(page, {});
  expect(page.setExtraHTTPHeaders).not.toHaveBeenCalled();
});
