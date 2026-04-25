const { parseClickOptions, buildClickScript, describeClick, clampClickDelay } = require('./screenshot-click');

describe('clampClickDelay', () => {
  it('returns default for NaN', () => expect(clampClickDelay(NaN)).toBe(100));
  it('clamps to 0 minimum', () => expect(clampClickDelay(-50)).toBe(0));
  it('clamps to 5000 maximum', () => expect(clampClickDelay(9999)).toBe(5000));
  it('passes valid value through', () => expect(clampClickDelay(200)).toBe(200));
});

describe('parseClickOptions', () => {
  it('accepts selector', () => {
    const o = parseClickOptions({ selector: '#btn' });
    expect(o.selector).toBe('#btn');
    expect(o.button).toBe('left');
    expect(o.double).toBe(false);
  });

  it('accepts x/y coordinates', () => {
    const o = parseClickOptions({ x: 100, y: 200 });
    expect(o.x).toBe(100);
    expect(o.y).toBe(200);
  });

  it('throws without selector or coordinates', () => {
    expect(() => parseClickOptions({})).toThrow('click requires either a selector');
  });

  it('throws on invalid button', () => {
    expect(() => parseClickOptions({ selector: '#a', button: 'side' })).toThrow('invalid button');
  });

  it('throws on negative x', () => {
    expect(() => parseClickOptions({ x: -1, y: 0 })).toThrow('x must be a non-negative number');
  });

  it('throws on empty selector', () => {
    expect(() => parseClickOptions({ selector: '  ' })).toThrow('non-empty string');
  });

  it('sets waitForNav', () => {
    const o = parseClickOptions({ selector: '#a', waitForNav: true });
    expect(o.waitForNav).toBe(true);
  });
});

describe('buildClickScript', () => {
  it('builds selector click', () => {
    const o = parseClickOptions({ selector: '#submit' });
    const s = buildClickScript(o);
    expect(s).toContain('page.click("#submit"');
  });

  it('builds coordinate click', () => {
    const o = parseClickOptions({ x: 50, y: 80 });
    const s = buildClickScript(o);
    expect(s).toContain('page.mouse.click(50, 80');
  });

  it('uses dblclick for double', () => {
    const o = parseClickOptions({ selector: '#d', double: true });
    expect(buildClickScript(o)).toContain('dblclick');
  });

  it('wraps with waitForNavigation when requested', () => {
    const o = parseClickOptions({ selector: '#nav', waitForNav: true });
    expect(buildClickScript(o)).toContain('waitForNavigation');
  });
});

describe('describeClick', () => {
  it('describes selector click', () => {
    const o = parseClickOptions({ selector: '#go' });
    expect(describeClick(o)).toMatch(/selector "#go"/);
  });

  it('describes coordinate click', () => {
    const o = parseClickOptions({ x: 10, y: 20 });
    expect(describeClick(o)).toMatch(/\(10, 20\)/);
  });

  it('mentions double-click', () => {
    const o = parseClickOptions({ selector: '#x', double: true });
    expect(describeClick(o)).toMatch(/double-click/);
  });
});
