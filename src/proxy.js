import { createServer } from 'http';
import { URL } from 'url';

const DEFAULT_PORT = 0; // 0 = OS assigns port

export function parseProxyOptions(options = {}) {
  return {
    port: options.port ?? DEFAULT_PORT,
    headers: options.headers ?? {},
    blockList: Array.isArray(options.blockList) ? options.blockList : [],
    allowList: Array.isArray(options.allowList) ? options.allowList : [],
    rewriteRules: Array.isArray(options.rewriteRules) ? options.rewriteRules : [],
  };
}

export function applyRewriteRules(url, rules) {
  let result = url;
  for (const { pattern, replacement } of rules) {
    const re = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    result = result.replace(re, replacement);
  }
  return result;
}

export function isBlocked(url, blockList, allowList) {
  if (allowList.length > 0) {
    const allowed = allowList.some(p => url.includes(p));
    if (!allowed) return true;
  }
  return blockList.some(p => url.includes(p));
}

export function buildProxyConfig(options = {}) {
  const parsed = parseProxyOptions(options);
  return {
    server: null,
    port: parsed.port,
    options: parsed,
  };
}

export function startProxy(options = {}) {
  const config = buildProxyConfig(options);
  const server = createServer((req, res) => {
    const rawUrl = req.url || '/';
    if (isBlocked(rawUrl, config.options.blockList, config.options.allowList)) {
      res.writeHead(403);
      res.end('blocked');
      return;
    }
    const rewritten = applyRewriteRules(rawUrl, config.options.rewriteRules);
    res.writeHead(200, { 'x-proxy-url': rewritten, ...config.options.headers });
    res.end(rewritten);
  });
  return new Promise((resolve) => {
    server.listen(config.options.port, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

export function stopProxy(handle) {
  return new Promise((resolve, reject) => {
    if (!handle || !handle.server) return resolve();
    handle.server.close((err) => (err ? reject(err) : resolve()));
  });
}
