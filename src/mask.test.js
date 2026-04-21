const { parseMaskRegion, parseMasks, describeMask } = require('./mask');

describe('parseMaskRegion', () => {
  test('parses comma-separated string', () => {
    const r = parseMaskRegion('10,20,300,400');
    expect(r).toEqual({ x: 10, y: 20, width: 300, height: 400, color: [0, 0, 0] });
  });

  test('parses object with defaults', () => {
    const r = parseMaskRegion({ width: 100, height: 50 });
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(r.width).toBe(100);
    expect(r.height).toBe(50);
    expect(r.color).toEqual([0, 0, 0]);
  });

  test('parses object with custom color', () => {
    const r = parseMaskRegion({ x: 5, y: 5, width: 50, height: 50, color: [255, 0, 0] });
    expect(r.color).toEqual([255, 0, 0]);
  });

  test('throws on invalid string', () => {
    expect(() => parseMaskRegion('10,20')).toThrow('Invalid mask region');
    expect(() => parseMaskRegion('a,b,c,d')).toThrow('Invalid mask region');
  });

  test('throws on object missing width/height', () => {
    expect(() => parseMaskRegion({ x: 0, y: 0 })).toThrow('width and height');
  });

  test('throws on unsupported type', () => {
    expect(() => parseMaskRegion(42)).toThrow('Unsupported mask region type');
  });
});

describe('parseMasks', () => {
  test('returns empty array for no input', () => {
    expect(parseMasks()).toEqual([]);
    expect(parseMasks([])).toEqual([]);
  });

  test('parses multiple regions', () => {
    const masks = parseMasks(['0,0,100,50', { x: 10, y: 10, width: 20, height: 20 }]);
    expect(masks).toHaveLength(2);
    expect(masks[0].width).toBe(100);
    expect(masks[1].x).toBe(10);
  });
});

describe('describeMask', () => {
  test('formats region as string', () => {
    const r = parseMaskRegion('5,10,200,100');
    expect(describeMask(r)).toBe('rect(5,10,200x100)');
  });
});
