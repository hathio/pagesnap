export const SESSION_MODES = ['auto', 'manual', 'ci'];

export function parseSessionMode(value) {
  const mode = (value || 'auto').toLowerCase();
  if (!SESSION_MODES.includes(mode)) {
    throw new Error(`Unknown session mode: "${mode}". Valid modes: ${SESSION_MODES.join(', ')}`);
  }
  return mode;
}

export function buildSessionMeta(mode, env = process.env) {
  const base = { mode, startedAt: new Date().toISOString() };

  if (mode === 'ci') {
    const buildUrl = env.CI_JOB_URL ||
      (env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
        ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
        : undefined);

    return {
      ...base,
      label: env.CI_JOB_NAME || env.GITHUB_WORKFLOW || 'ci',
      commit: env.GITHUB_SHA || env.CI_COMMIT_SHA || undefined,
      branch: env.GITHUB_REF_NAME || env.CI_COMMIT_BRANCH || undefined,
      buildUrl,
    };
  }

  if (mode === 'manual') {
    return {
      ...base,
      label: env.PAGESNAP_SESSION_LABEL || 'manual',
    };
  }

  // auto
  return {
    ...base,
    label: env.PAGESNAP_SESSION_LABEL || `auto-${Date.now()}`,
  };
}

export function describeSessionStrategy(mode) {
  switch (mode) {
    case 'ci':     return 'CI mode: enriches session with build/commit metadata from environment';
    case 'manual': return 'Manual mode: uses PAGESNAP_SESSION_LABEL or defaults to "manual"';
    case 'auto':   return 'Auto mode: generates a timestamped label automatically';
    default:       return `Unknown mode: ${mode}`;
  }
}
