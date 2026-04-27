const { parseNetworkOptions, buildNetworkScript, describeNetwork, listPresets, PRESETS } = require('./screenshot-network');

test('listPresets returns known preset names', () => {
  const presets = listPresets();
  expect(presets).toContain('fast3g');
  expect(presets).toContain('slow3g');
  expect(presets).toContain('offline');
});

test('parseNetworkOptions returns null for empty input', () => {
  expect(parseNetworkOptions()).toBeNull();
  expect(parseNetworkOptions({})).toBeNull();
});

test('parseNetworkOptions accepts string preset', () => {
  const opts = parseNetworkOptions('fast3g');
  expect(opts.preset).toBe('fast3g');
  expect(opts.downloadThroughput).toBe(PRESETS.fast3g.downloadThroughput);
  expect(opts.latency).toBe(PRESETS.fast3g.latency);
});

test('parseNetworkOptions throws on unknown string preset', () => {
  expect(() => parseNetworkOptions('superfast')).toThrow('Unknown network preset');
});

test('parseNetworkOptions accepts object with preset key', () => {
  const opts = parseNetworkOptions({ preset: 'slow3g' });
  expect(opts.preset).toBe('slow3g');
  expect(opts.latency).toBe(PRESETS.slow3g.latency);
});

test('parseNetworkOptions merges preset with overrides', () => {
  const opts = parseNetworkOptions({ preset: 'slow3g', latency: 500 });
  expect(opts.latency).toBe(500);
  expect(opts.downloadThroughput).toBe(PRESETS.slow3g.downloadThroughput);
});

test('parseNetworkOptions accepts raw values without preset', () => {
  const opts = parseNetworkOptions({ downloadThroughput: 200000, latency: 100 });
  expect(opts.downloadThroughput).toBe(200000);
  expect(opts.latency).toBe(100);
});

test('parseNetworkOptions throws on negative downloadThroughput', () => {
  expect(() => parseNetworkOptions({ downloadThroughput: -1 })).toThrow('>= 0');
});

test('buildNetworkScript returns empty string for null', () => {
  expect(buildNetworkScript(null)).toBe('');
});

test('buildNetworkScript includes emulateNetworkConditions call', () => {
  const opts = parseNetworkOptions('2g');
  const script = buildNetworkScript(opts);
  expect(script).toContain('emulateNetworkConditions');
  expect(script).toContain('downloadThroughput');
});

test('describeNetwork returns readable label for preset', () => {
  const opts = parseNetworkOptions('fast3g');
  const desc = describeNetwork(opts);
  expect(desc).toContain('fast3g');
});

test('describeNetwork returns offline for offline preset', () => {
  const opts = parseNetworkOptions('offline');
  expect(describeNetwork(opts)).toBe('offline');
});

test('describeNetwork returns no throttling for null', () => {
  expect(describeNetwork(null)).toBe('no throttling');
});
