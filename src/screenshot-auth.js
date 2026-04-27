// screenshot-auth.js — handle HTTP auth options for captures

const SUPPORTED_TYPES = ['basic', 'bearer', 'header'];

function parseAuthOptions(input = {}) {
  if (!input || typeof input !== 'object') {
    return { type: 'none' };
  }

  const type = (input.type || 'none').toLowerCase();

  if (type === 'none') return { type: 'none' };

  if (!SUPPORTED_TYPES.includes(type)) {
    throw new Error(`Unknown auth type: "${type}". Supported: ${SUPPORTED_TYPES.join(', ')}`);
  }

  if (type === 'basic') {
    if (!input.username || !input.password) {
      throw new Error('Basic auth requires username and password');
    }
    return {
      type: 'basic',
      username: String(input.username),
      password: String(input.password),
    };
  }

  if (type === 'bearer') {
    if (!input.token) {
      throw new Error('Bearer auth requires a token');
    }
    return {
      type: 'bearer',
      token: String(input.token),
    };
  }

  if (type === 'header') {
    if (!input.name || !input.value) {
      throw new Error('Header auth requires name and value');
    }
    return {
      type: 'header',
      name: String(input.name),
      value: String(input.value),
    };
  }
}

function buildAuthHeaders(auth) {
  if (!auth || auth.type === 'none') return {};

  if (auth.type === 'basic') {
    const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    return { Authorization: `Basic ${encoded}` };
  }

  if (auth.type === 'bearer') {
    return { Authorization: `Bearer ${auth.token}` };
  }

  if (auth.type === 'header') {
    return { [auth.name]: auth.value };
  }

  return {};
}

function describeAuth(auth) {
  if (!auth || auth.type === 'none') return 'no authentication';
  if (auth.type === 'basic') return `basic auth (user: ${auth.username})`;
  if (auth.type === 'bearer') return `bearer token (${auth.token.slice(0, 8)}...)`;
  if (auth.type === 'header') return `custom header (${auth.name})`;
  return 'unknown auth';
}

module.exports = { parseAuthOptions, buildAuthHeaders, describeAuth, SUPPORTED_TYPES };
