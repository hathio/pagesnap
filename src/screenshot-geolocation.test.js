const { parseGeolocation, validateGeolocation, buildGeolocationContext, describeGeolocation, listPresets } = require('./screenshot-geolocation');

test('parses preset by name', () => {
  const geo = parseGeolocation('london');
  expect(geo.latitude).toBeCloseTo(51.5074);
  expect(geo.longitude).toBeCloseTo(-0.1278);
});

test('preset name is case-insensitive', () => {
  const geo = parseGeolocation('TOKYO');
  expect(geo.latitude).toBeCloseTo(35.6762);
});

test('parses lat,lng string', () => {
  const geo = parseGeolocation('48.8566,2.3522');
  expect(geo.latitude).toBe(48.8566);
  expect(geo.longitude).toBe(2.3522);
  expect(geo.accuracy).toBe(100);
});

test('parses lat,lng,accuracy string', () => {
  const geo = parseGeolocation('48.8566,2.3522,25');
  expect(geo.accuracy).toBe(25);
});

test('parses object input', () => {
  const geo = parseGeolocation({ latitude: 10, longitude: 20, accuracy: 5 });
  expect(geo).toEqual({ latitude: 10, longitude: 20, accuracy: 5 });
});

test('object defaults accuracy to 100', () => {
  const geo = parseGeolocation({ latitude: 10, longitude: 20 });
  expect(geo.accuracy).toBe(100);
});

test('throws on unknown preset string', () => {
  expect(() => parseGeolocation('atlantis')).toThrow('Invalid geolocation');
});

test('throws on bad lat,lng string', () => {
  expect(() => parseGeolocation('abc,def')).toThrow('Invalid geolocation');
});

test('validateGeolocation throws on bad latitude', () => {
  expect(() => validateGeolocation({ latitude: 100, longitude: 0, accuracy: 10 })).toThrow('Latitude out of range');
});

test('validateGeolocation throws on bad longitude', () => {
  expect(() => validateGeolocation({ latitude: 0, longitude: 200, accuracy: 10 })).toThrow('Longitude out of range');
});

test('buildGeolocationContext returns null for falsy input', () => {
  expect(buildGeolocationContext(null)).toBeNull();
});

test('buildGeolocationContext returns context object', () => {
  const ctx = buildGeolocationContext({ latitude: 51.5, longitude: -0.1, accuracy: 50 });
  expect(ctx).toMatchObject({ latitude: 51.5, longitude: -0.1, accuracy: 50 });
});

test('describeGeolocation returns none for null', () => {
  expect(describeGeolocation(null)).toBe('none');
});

test('describeGeolocation formats values', () => {
  const desc = describeGeolocation({ latitude: 35.68, longitude: 139.69, accuracy: 50 });
  expect(desc).toContain('lat=35.68');
  expect(desc).toContain('lng=139.69');
});

test('listPresets returns all built-in presets', () => {
  const presets = listPresets();
  const names = presets.map(p => p.name);
  expect(names).toContain('london');
  expect(names).toContain('tokyo');
  expect(names).toContain('new-york');
});
