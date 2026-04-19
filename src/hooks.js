const { execSync } = require('child_process');

function runHook(hookCmd, context = {}) {
  if (!hookCmd) return;
  const env = {
    ...process.env,
    PAGESNAP_EVENT: context.event || '',
    PAGESNAP_CHANGED: String(context.changed ?? ''),
    PAGESNAP_TOTAL: String(context.total ?? ''),
    PAGESNAP_ERRORS: String(context.errors ?? ''),
  };
  try {
    execSync(hookCmd, { env, stdio: 'inherit', shell: true });
  } catch (err) {
    console.error(`[pagesnap] hook failed: ${hookCmd}`);
    console.error(err.message);
  }
}

function buildHookContext(event, results = []) {
  return {
    event,
    total: results.length,
    changed: results.filter(r => r.diffPercent > 0).length,
    errors: results.filter(r => r.error).length,
  };
}

async function runLifecycleHooks(config, event, results = []) {
  const hooks = config.hooks || {};
  const cmd = hooks[event];
  if (!cmd) return;
  const context = buildHookContext(event, results);
  runHook(cmd, context);
}

module.exports = { runHook, buildHookContext, runLifecycleHooks };
