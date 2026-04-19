const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getCacheDir(baseDir) {
  return path.join(baseDir, '.pagesnap-cache');
}

function hashUrl(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

function getCacheEntry(baseDir, url) {
  const cacheDir = getCacheDir(baseDir);
  const file = path.join(cacheDir, hashUrl(url) + '.json');
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCacheEntry(baseDir, url, data) {
  const cacheDir = getCacheDir(baseDir);
  fs.mkdirSync(cacheDir, { recursive: true });
  const file = path.join(cacheDir, hashUrl(url) + '.json');
  fs.writeFileSync(file, JSON.stringify({ url, timestamp: Date.now(), ...data }, null, 2));
}

function isCacheFresh(entry, ttlMs = 5 * 60 * 1000) {
  if (!entry || !entry.timestamp) return false;
  return Date.now() - entry.timestamp < ttlMs;
}

function clearCache(baseDir) {
  const cacheDir = getCacheDir(baseDir);
  if (!fs.existsSync(cacheDir)) return;
  for (const f of fs.readdirSync(cacheDir)) {
    fs.unlinkSync(path.join(cacheDir, f));
  }
}

module.exports = { getCacheDir, hashUrl, getCacheEntry, setCacheEntry, isCacheFresh, clearCache };
