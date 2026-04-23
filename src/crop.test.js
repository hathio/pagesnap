const { parseCropRegion, parseCrops, resolveCoordinates, buildCropOptions, describeCrop } = require('./crop');

test('parseCropRegion accepts valid region', () => {
  const r = parseCropRegion({ x: 10, y: 20, width: 100, height: 50 });
  expect(r).toEqual({ x: 10, y: 20, width: 100, height: 50, origin: 'top-left' });
});

test('parseCropRegion defaults x/y to 0', () => {
  const r = parseCropRegion({ width: 80, height: 40 });
  expect(r.x).toBe(0);
  expect(r.y).toBe(0);
});

test('parseCropRegion throws on missing width', () => {
  expect(() => parseCropRegion({ height: 50 })).toThrow('width');
});

test('parseCropRegion throws on invalid origin', () => {
  expect(() => parseCropRegion({ width: 10, height: 10, origin: 'center' })).toThrow('origin');
});

test('parseCrops handles array', () => {
  const crops = parseCrops([{ width: 10, height: 10 }, { width: 20, height: 20 }]);
  expect(crops).toHaveLength(2);
});

test('parseCrops handles single object', () => {
  const crops = parseCrops({ width: 30, height: 30 });
  expect(crops).toHaveLength(1);
});

test('parseCrops returns empty array for falsy input', () => {
  expect(parseCrops(null)).toEqual([]);
});

test('resolveCoordinates top-left unchanged', () => {
  const r = resolveCoordinates({ x: 5, y: 5, width: 50, height: 50, origin: 'top-left' }, 200, 200);
  expect(r).toEqual({ x: 5, y: 5, width: 50, height: 50 });
});

test('resolveCoordinates bottom-right flips axes', () => {
  const r = resolveCoordinates({ x: 0, y: 0, width: 50, height: 50, origin: 'bottom-right' }, 200, 200);
  expect(r.x).toBe(150);
  expect(r.y).toBe(150);
});

test('resolveCoordinates clamps to image bounds', () => {
  const r = resolveCoordinates({ x: 180, y: 180, width: 100, height: 100, origin: 'top-left' }, 200, 200);
  expect(r.width).toBe(20);
  expect(r.height).toBe(20);
});

test('buildCropOptions maps all crops', () => {
  const crops = [{ x: 0, y: 0, width: 10, height: 10, origin: 'top-left' }];
  const opts = buildCropOptions(crops, 100, 100);
  expect(opts).toHaveLength(1);
  expect(opts[0]).toMatchObject({ x: 0, y: 0, width: 10, height: 10 });
});

test('describeCrop returns readable string', () => {
  const desc = describeCrop({ x: 10, y: 20, width: 100, height: 50, origin: 'top-left' });
  expect(desc).toBe('100x50 at (10,20) from top-left');
});
