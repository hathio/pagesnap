const { parseDelayOptions, totalDelay, describeDelay, buildDelayScript, clampDelay } = require('./screenshot-delay');

describe('clampDelay', () => {
  it('clamps below min to 0', () => {
    expect(clampDelay(-100)).toBe(0);
  });

  it('clamps above max to 30000', () => {
    expect(clampDelay(99999)).toBe(30000);
  });

  it('rounds fractional ms', () => {
    expect(clampDelay(200.7)).toBe(201);
  });
});

describe('parseDelayOptions', () => {
  it('defaults to zero delays', () => {
    expect(parseDelayOptions({})).toEqual({ delay: 0, afterLoad: 0, afterNetworkIdle: 0 });
  });

  it('accepts a plain number as delay', () => {
    expect(parseDelayOptions(500)).toEqual({ delay: 500, afterLoad: 0, afterNetworkIdle: 0 });
  });

  it('parses all fields', () => {
    expect(parseDelayOptions({ delay: 100, afterLoad: 200, afterNetworkIdle: 300 }))
      .toEqual({ delay: 100, afterLoad: 200, afterNetworkIdle: 300 });
  });

  it('throws on non-numeric delay', () => {
    expect(() => parseDelayOptions({ delay: 'fast' })).toThrow('Invalid delay value');
  });

  it('throws on non-numeric afterLoad', () => {
    expect(() => parseDelayOptions({ afterLoad: 'soon' })).toThrow('Invalid afterLoad delay');
  });

  it('clamps values that exceed max', () => {
    const result = parseDelayOptions({ delay: 50000 });
    expect(result.delay).toBe(30000);
  });
});

describe('totalDelay', () => {
  it('sums all delay components', () => {
    expect(totalDelay({ delay: 100, afterLoad: 200, afterNetworkIdle: 50 })).toBe(350);
  });

  it('returns 0 with no options', () => {
    expect(totalDelay({})).toBe(0);
  });
});

describe('describeDelay', () => {
  it('returns no delay for empty options', () => {
    expect(describeDelay({})).toBe('no delay');
  });

  it('describes individual parts', () => {
    const desc = describeDelay({ delay: 500, afterLoad: 300 });
    expect(desc).toContain('base 500ms');
    expect(desc).toContain('after-load 300ms');
  });
});

describe('buildDelayScript', () => {
  it('returns null when no delay needed', () => {
    expect(buildDelayScript({})).toBeNull();
  });

  it('returns setTimeout script for positive delay', () => {
    const script = buildDelayScript({ delay: 250 });
    expect(script).toContain('setTimeout');
    expect(script).toContain('250');
  });
});
