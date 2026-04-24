const { parseScrollOptions, buildScrollScript, describeScroll, listScrollModes, SCROLL_MODES } = require('./screenshot-scroll');

describe('parseScrollOptions', () => {
  it('returns defaults when called with empty object', () => {
    const opts = parseScrollOptions({});
    expect(opts.mode).toBe('none');
    expect(opts.delay).toBe(300);
    expect(opts.steps).toBe(5);
    expect(opts.scrollTo).toBeNull();
  });

  it('clamps delay within bounds', () => {
    expect(parseScrollOptions({ delay: -100 }).delay).toBe(0);
    expect(parseScrollOptions({ delay: 99999 }).delay).toBe(5000);
    expect(parseScrollOptions({ delay: 500 }).delay).toBe(500);
  });

  it('clamps steps within bounds', () => {
    expect(parseScrollOptions({ steps: 0 }).steps).toBe(1);
    expect(parseScrollOptions({ steps: 100 }).steps).toBe(50);
    expect(parseScrollOptions({ steps: 10 }).steps).toBe(10);
  });

  it('falls back to none for unknown mode', () => {
    expect(parseScrollOptions({ mode: 'bounce' }).mode).toBe('none');
  });

  it('parses scrollTo as non-negative integer', () => {
    expect(parseScrollOptions({ mode: 'manual', scrollTo: -50 }).scrollTo).toBe(0);
    expect(parseScrollOptions({ mode: 'manual', scrollTo: 800 }).scrollTo).toBe(800);
  });
});

describe('buildScrollScript', () => {
  it('returns null for mode none', () => {
    expect(buildScrollScript({ mode: 'none' })).toBeNull();
  });

  it('returns a script string for full mode', () => {
    const script = buildScrollScript({ mode: 'full', steps: 3, delay: 200 });
    expect(typeof script).toBe('string');
    expect(script).toContain('scrollBy');
    expect(script).toContain('200');
    expect(script).toContain('3');
  });

  it('returns a script string for manual mode with scrollTo', () => {
    const script = buildScrollScript({ mode: 'manual', scrollTo: 600, delay: 100 });
    expect(script).toContain('scrollTo');
    expect(script).toContain('600');
  });

  it('returns null for manual mode without scrollTo', () => {
    expect(buildScrollScript({ mode: 'manual' })).toBeNull();
  });
});

describe('describeScroll', () => {
  it('describes none mode', () => {
    expect(describeScroll({ mode: 'none' })).toBe('no scroll');
  });

  it('describes full mode', () => {
    const desc = describeScroll({ mode: 'full', steps: 4, delay: 250 });
    expect(desc).toContain('full-page');
    expect(desc).toContain('4 steps');
  });

  it('describes manual mode', () => {
    const desc = describeScroll({ mode: 'manual', scrollTo: 300, delay: 150 });
    expect(desc).toContain('300px');
  });
});

describe('listScrollModes', () => {
  it('returns all modes', () => {
    const modes = listScrollModes();
    expect(modes.map(m => m.mode)).toEqual(SCROLL_MODES);
  });

  it('each entry has a description', () => {
    listScrollModes().forEach(m => {
      expect(typeof m.description).toBe('string');
      expect(m.description.length).toBeGreaterThan(0);
    });
  });
});
