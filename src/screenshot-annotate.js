// screenshot-annotate.js — add text/shape annotations to screenshots

const VALID_TYPES = ['text', 'rect', 'arrow'];
const VALID_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'];

function parseAnnotation(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Annotation must be an object');
  const { type = 'text', content = '', x = 0, y = 0, color = '#ff0000', fontSize = 14, position } = raw;

  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid annotation type "${type}". Valid: ${VALID_TYPES.join(', ')}`);
  }
  if (type === 'text' && !content) {
    throw new Error('Text annotation requires non-empty content');
  }
  if (position && !VALID_POSITIONS.includes(position)) {
    throw new Error(`Invalid position "${position}". Valid: ${VALID_POSITIONS.join(', ')}`);
  }

  return { type, content, x: Number(x), y: Number(y), color, fontSize: Number(fontSize), position: position || null };
}

function parseAnnotations(rawList) {
  if (!rawList) return [];
  const list = Array.isArray(rawList) ? rawList : [rawList];
  return list.map((a, i) => {
    try {
      return parseAnnotation(a);
    } catch (err) {
      throw new Error(`Annotation[${i}]: ${err.message}`);
    }
  });
}

function buildAnnotationScript(annotations) {
  if (!annotations || annotations.length === 0) return null;

  const steps = annotations.map(a => {
    if (a.type === 'text') {
      return `ctx.font='${a.fontSize}px sans-serif';ctx.fillStyle='${a.color}';ctx.fillText(${JSON.stringify(a.content)},${a.x},${a.y});`;
    }
    if (a.type === 'rect') {
      return `ctx.strokeStyle='${a.color}';ctx.lineWidth=2;ctx.strokeRect(${a.x},${a.y},100,40);`;
    }
    if (a.type === 'arrow') {
      return `ctx.strokeStyle='${a.color}';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(${a.x},${a.y});ctx.lineTo(${a.x + 30},${a.y});ctx.stroke();`;
    }
    return '';
  });

  return `(function(){
  var c=document.createElement('canvas');
  var ctx=c.getContext('2d');
  ${steps.join('\n  ')}
})();`;
}

function describeAnnotation(a) {
  const pos = a.position ? ` at ${a.position}` : ` at (${a.x},${a.y})`;
  if (a.type === 'text') return `text "${a.content}"${pos} [${a.color}, ${a.fontSize}px]`;
  return `${a.type}${pos} [${a.color}]`;
}

module.exports = { parseAnnotation, parseAnnotations, buildAnnotationScript, describeAnnotation };
