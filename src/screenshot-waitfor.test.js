const { parseWaitCondition, parseWaitConditions, buildWaitScript, describeWait, listWaitTypes, clampWaitTimeout } = require('./screenshot-waitfor');

test('clampWaitTimeout clamps to max', () => {
  expect(clampWaitTimeout(999999)).toBe(60000);
  expect(clampWaitTimeout(-100)).toBe(0);
  expect(clampWaitTimeout(NaN)).toBe(5000);
  expect(clampWaitTimeout(3000)).toBe(3000);
});

test('parseWaitCondition selector', () => {
  const c = parseWaitCondition({ type: 'selector', selector: '#app', timeout: 2000 });
  expect(c).toEqual({ type: 'selector', selector: '#app', timeout: 2000 });
});

test('parseWaitCondition selector requires selector string', () => {
  expect(() => parseWaitCondition({ type: 'selector' })).toThrow('selector');
});

test('parseWaitCondition function', () => {
  const c = parseWaitCondition({ type: 'function', fn: '() => document.readyState === "complete"' });
  expect(c.type).toBe('function');
  expect(c.fn).toContain('readyState');
});

test('parseWaitCondition function requires fn', () => {
  expect(() => parseWaitCondition({ type: 'function' })).toThrow('fn');
});

test('parseWaitCondition network defaults idle', () => {
  const c = parseWaitCondition({ type: 'network' });
  expect(c.idle).toBe('networkidle2');
});

test('parseWaitCondition timeout type', () => {
  const c = parseWaitCondition({ type: 'timeout', timeout: 1500 });
  expect(c).toEqual({ type: 'timeout', timeout: 1500 });
});

test('parseWaitCondition unknown type throws', () => {
  expect(() => parseWaitCondition({ type: 'magic' })).toThrow('Unknown wait type');
});

test('parseWaitConditions wraps single object', () => {
  const result = parseWaitConditions({ type: 'timeout', timeout: 500 });
  expect(result).toHaveLength(1);
});

test('parseWaitConditions returns empty for null', () => {
  expect(parseWaitConditions(null)).toEqual([]);
});

test('buildWaitScript returns null for empty', () => {
  expect(buildWaitScript([])).toBeNull();
});

test('buildWaitScript selector', () => {
  const script = buildWaitScript([{ type: 'selector', selector: '#root', timeout: 3000 }]);
  expect(script).toContain('waitForSelector');
  expect(script).toContain('#root');
});

test('buildWaitScript timeout', () => {
  const script = buildWaitScript([{ type: 'timeout', timeout: 800 }]);
  expect(script).toContain('setTimeout');
  expect(script).toContain('800');
});

test('describeWait selector', () => {
  const d = describeWait({ type: 'selector', selector: '.hero', timeout: 2000 });
  expect(d).toContain('.hero');
});

test('listWaitTypes returns all types', () => {
  const types = listWaitTypes();
  expect(types.map(t => t.type)).toEqual(['selector', 'network', 'timeout', 'function']);
});
