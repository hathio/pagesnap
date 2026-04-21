export const AUDIT_ACTIONS = [
  'capture',
  'diff',
  'promote',
  'export',
  'clear-cache',
  'delete-baseline',
];

export function parseAuditLevel(value) {
  const valid = ['none', 'errors', 'all'];
  const level = (value || 'all').toLowerCase();
  if (!valid.includes(level)) {
    throw new Error(`Invalid audit level "${value}". Must be one of: ${valid.join(', ')}`);
  }
  return level;
}

export function shouldAudit(action, level) {
  if (level === 'none') return false;
  if (level === 'errors') return action.startsWith('error:');
  return true;
}

export function describeAuditStrategy(level) {
  switch (level) {
    case 'none': return 'Auditing disabled';
    case 'errors': return 'Audit errors only';
    case 'all': return 'Audit all actions';
    default: return `Unknown audit level: ${level}`;
  }
}

export function buildAuditContext(action, extra = {}) {
  if (!AUDIT_ACTIONS.includes(action) && !action.startsWith('error:')) {
    throw new Error(`Unknown audit action: ${action}`);
  }
  return { action, ...extra };
}
