// Screenshot pipeline configuration — assembles ordered steps for capture
// This file is updated to include device emulation as a pipeline step.

const { parseEmulateOptions, buildEmulateScript } = require('./screenshot-emulate');
const { parseDelayOptions, buildDelayScript } = require('./screenshot-delay');
const { parseScrollOptions, buildScrollScript } = require('./screenshot-scroll');
const { parseWaitConditions, buildWaitScript } = require('./screenshot-waitfor');
const { parseClickOptions, buildClickScript } = require('./screenshot-click');

const STEP_ORDER = ['emulate', 'cookies', 'localStorage', 'auth', 'wait', 'scroll', 'click', 'hover', 'input', 'delay', 'annotate'];

function buildPipelineConfig(raw = {}) {
  return {
    emulate: parseEmulateOptions(raw.emulate || {}),
    delay: parseDelayOptions(raw.delay || {}),
    scroll: parseScrollOptions(raw.scroll || {}),
    wait: raw.wait ? parseWaitConditions(raw.wait) : [],
    click: parseClickOptions(raw.click || {}),
    stepOrder: raw.stepOrder || STEP_ORDER,
  };
}

function assemblePipelineScript(config) {
  const steps = [];

  if (config.emulate) {
    const s = buildEmulateScript(config.emulate);
    if (s) steps.push({ name: 'emulate', script: s });
  }

  if (config.wait && config.wait.length > 0) {
    const s = buildWaitScript(config.wait);
    if (s) steps.push({ name: 'wait', script: s });
  }

  if (config.scroll) {
    const s = buildScrollScript(config.scroll);
    if (s) steps.push({ name: 'scroll', script: s });
  }

  if (config.click) {
    const s = buildClickScript(config.click);
    if (s) steps.push({ name: 'click', script: s });
  }

  if (config.delay) {
    const s = buildDelayScript(config.delay);
    if (s) steps.push({ name: 'delay', script: s });
  }

  // Sort by configured step order
  const order = config.stepOrder || STEP_ORDER;
  steps.sort((a, b) => {
    const ai = order.indexOf(a.name);
    const bi = order.indexOf(b.name);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return steps.map(s => `// step: ${s.name}\n${s.script}`).join('\n\n');
}

function describePipeline(config) {
  const active = [];
  if (config.emulate) active.push('emulate');
  if (config.wait && config.wait.length > 0) active.push(`wait(${config.wait.length})`);
  if (config.scroll) active.push('scroll');
  if (config.click) active.push('click');
  if (config.delay) active.push('delay');
  return active.length ? `pipeline: [${active.join(' → ')}]` : 'pipeline: empty';
}

module.exports = { buildPipelineConfig, assemblePipelineScript, describePipeline, STEP_ORDER };
