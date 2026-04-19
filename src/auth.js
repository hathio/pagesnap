import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const TOKEN_FILE = '.pagesnap-token';

export function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function getTokenPath(baseDir = process.cwd()) {
  return path.join(baseDir, TOKEN_FILE);
}

export function writeToken(token, baseDir = process.cwd()) {
  const tokenPath = getTokenPath(baseDir);
  fs.writeFileSync(tokenPath, token, 'utf8');
  return tokenPath;
}

export function readToken(baseDir = process.cwd()) {
  const tokenPath = getTokenPath(baseDir);
  if (!fs.existsSync(tokenPath)) return null;
  return fs.readFileSync(tokenPath, 'utf8').trim();
}

export function validateToken(provided, baseDir = process.cwd()) {
  if (!provided) return false;
  const stored = readToken(baseDir);
  if (!stored) return false;
  return crypto.timingSafeEqual(
    Buffer.from(provided.padEnd(48)),
    Buffer.from(stored.padEnd(48))
  );
}

export function authMiddleware(baseDir = process.cwd()) {
  return (req, res, next) => {
    const stored = readToken(baseDir);
    if (!stored) return next();
    const header = req.headers['x-pagesnap-token'] || '';
    if (!validateToken(header, baseDir)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    next();
  };
}
