import fs from 'fs';
import path from 'path';

const KNOWN_VARS = [
  'PAGESNAP_BASE_URL',
  'PAGESNAP_OUTPUT_DIR',
  'PAGESNAP_TOKEN',
  'PAGESNAP_TIMEOUT',
  'PAGESNAP_VIEWPORT',
  'PAGESNAP_CONCURRENCY',
];

export function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const vars = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    vars[key] = val;
  }
  return vars;
}

export function applyEnvToConfig(config, env = process.env) {
  const out = { ...config };
  if (env.PAGESNAP_BASE_URL) out.baseUrl = env.PAGESNAP_BASE_URL;
  if (env.PAGESNAP_OUTPUT_DIR) out.outputDir = env.PAGESNAP_OUTPUT_DIR;
  if (env.PAGESNAP_TOKEN) out.token = env.PAGESNAP_TOKEN;
  if (env.PAGESNAP_TIMEOUT) out.timeout = parseInt(env.PAGESNAP_TIMEOUT, 10);
  if (env.PAGESNAP_VIEWPORT) out.viewport = env.PAGESNAP_VIEWPORT;
  if (env.PAGESNAP_CONCURRENCY) out.concurrency = parseInt(env.PAGESNAP_CONCURRENCY, 10);
  return out;
}

export function listKnownVars() {
  return KNOWN_VARS;
}

export function describeEnvVar(key) {
  const descriptions = {
    PAGESNAP_BASE_URL: 'Base URL prepended to all relative page paths',
    PAGESNAP_OUTPUT_DIR: 'Directory to store snapshots and diffs',
    PAGESNAP_TOKEN: 'Auth token for protected endpoints',
    PAGESNAP_TIMEOUT: 'Navigation timeout in milliseconds',
    PAGESNAP_VIEWPORT: 'Default viewport, e.g. 1280x800',
    PAGESNAP_CONCURRENCY: 'Number of parallel capture workers',
  };
  return descriptions[key] || null;
}

export function validateEnv(env = process.env) {
  const warnings = [];
  if (env.PAGESNAP_TIMEOUT && isNaN(parseInt(env.PAGESNAP_TIMEOUT, 10))) {
    warnings.push('PAGESNAP_TIMEOUT must be a number');
  }
  if (env.PAGESNAP_CONCURRENCY && isNaN(parseInt(env.PAGESNAP_CONCURRENCY, 10))) {
    warnings.push('PAGESNAP_CONCURRENCY must be a number');
  }
  if (env.PAGESNAP_VIEWPORT && !/^\d+x\d+$/.test(env.PAGESNAP_VIEWPORT)) {
    warnings.push('PAGESNAP_VIEWPORT must be in WIDTHxHEIGHT format, e.g. 1280x800');
  }
  return warnings;
}
