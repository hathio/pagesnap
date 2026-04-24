const { parseAnnotation, parseAnnotations, buildAnnotationScript, describeAnnotation } = require('./screenshot-annotate');

describe('parseAnnotation', () => {
  test('parses minimal text annotation', () => {
    const a = parseAnnotation({ type: 'text', content: 'hello', x: 10, y: 20 });
    expect(a.type).toBe('text');
    expect(a.content).toBe('hello');
    expect(a.x).toBe(10);
    expect(a.color).toBe('#ff0000');
    expect(a.fontSize).toBe(14);
  });

  test('parses rect annotation', () => {
    const a = parseAnnotation({ type: 'rect', x: 5, y: 5, color: '#00ff00' });
    expect(a.type).toBe('rect');
    expect(a.color).toBe('#00ff00');
  });

  test('throws on invalid type', () => {
    expect(() => parseAnnotation({ type: 'circle' })).toThrow('Invalid annotation type');
  });

  test('throws on empty text content', () => {
    expect(() => parseAnnotation({ type: 'text', content: '' })).toThrow('non-empty content');
  });

  test('throws on invalid position', () => {
    expect(() => parseAnnotation({ type: 'rect', position: 'middle' })).toThrow('Invalid position');
  });

  test('accepts valid position', () => {
    const a = parseAnnotation({ type: 'rect', position: 'top-left' });
    expect(a.position).toBe('top-left');
  });
});

describe('parseAnnotations', () => {
  test('returns empty array for null', () => {
    expect(parseAnnotations(null)).toEqual([]);
  });

  test('wraps single object in array', () => {
    const result = parseAnnotations({ type: 'rect', x: 0, y: 0 });
    expect(result).toHaveLength(1);
  });

  test('includes index in error message', () => {
    expect(() => parseAnnotations([{ type: 'text', content: 'ok' }, { type: 'bad' }])).toThrow('Annotation[1]');
  });
});

describe('buildAnnotationScript', () => {
  test('returns null for empty list', () => {
    expect(buildAnnotationScript([])).toBeNull();
  });

  test('includes fillText for text annotation', () => {
    const script = buildAnnotationScript([{ type: 'text', content: 'hi', x: 0, y: 0, color: '#000', fontSize: 12 }]);
    expect(script).toContain('fillText');
  });

  test('includes strokeRect for rect annotation', () => {
    const script = buildAnnotationScript([{ type: 'rect', x: 0, y: 0, color: '#f00' }]);
    expect(script).toContain('strokeRect');
  });
});

describe('describeAnnotation', () => {
  test('describes text annotation', () => {
    const desc = describeAnnotation({ type: 'text', content: 'yo', x: 5, y: 10, color: '#fff', fontSize: 16, position: null });
    expect(desc).toContain('text "yo"');
    expect(desc).toContain('#fff');
  });

  test('uses position label when set', () => {
    const desc = describeAnnotation({ type: 'rect', x: 0, y: 0, color: '#f00', position: 'top-right' });
    expect(desc).toContain('top-right');
  });
});
