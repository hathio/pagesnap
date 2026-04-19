const { getCacheEntry, setCacheEntry, isCacheFresh, clearCache, getCacheDir } = require('./cache');
const { loadConfig } = require('./config');
const path = require('path');
const fs = require('fs');

async function handleCacheCommand(argv) {
  const config = await loadConfig(argv.config);
  const baseDir = config.baseDir || process.cwd();

  if (argv._[1] === 'clear') {
    clearCache(baseDir);
    console.log('Cache cleared.');
    return;
  }

  if (argv._[1] === 'status') {
    const cacheDir = getCacheDir(baseDir);
    if (!fs.existsSync(cacheDir)) {
      console.log('No cache directory found.');
      return;
    }
    const files = fs.readdirSync(cacheDir);
    console.log(`Cache entries: ${files.length}`);
    const ttl = config.cacheTtl || 5 * 60 * 1000;
    let fresh = 0;
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(cacheDir, f), 'utf8');
        const entry = JSON.parse(raw);
        if (isCacheFresh(entry, ttl)) fresh++;
      } catch {}
    }
    console.log(`Fresh entries: ${fresh}`);
    console.log(`Stale entries: ${files.length - fresh}`);
    return;
  }

  if (argv._[1] === 'get' && argv._[2]) {
    const url = argv._[2];
    const entry = getCacheEntry(baseDir, url);
    if (!entry) {
      console.log(`No cache entry for: ${url}`);
    } else {
      console.log(JSON.stringify(entry, null, 2));
    }
    return;
  }

  console.log('Usage: pagesnap cache <clear|status|get <url>>');
}

module.exports = { handleCacheCommand };
