import chokidar from 'chokidar';
import path from 'path';
import { loadConfig } from './config.js';

let watcher = null;

export function startWatch(configPath, onChange) {
  const config = loadConfig(configPath);
  const watchPaths = resolveWatchPaths(config);

  watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300 },
  });

  watcher.on('change', (filePath) => {
    console.log(`[watch] changed: ${filePath}`);
    onChange(filePath);
  });

  watcher.on('add', (filePath) => {
    console.log(`[watch] added: ${filePath}`);
    onChange(filePath);
  });

  watcher.on('error', (err) => {
    console.error('[watch] error:', err);
  });

  console.log(`[watch] watching ${watchPaths.length} path(s)`);
  return watcher;
}

export function stopWatch() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log('[watch] stopped');
  }
}

function resolveWatchPaths(config) {
  const paths = [];
  if (config.watchPaths && Array.isArray(config.watchPaths)) {
    for (const p of config.watchPaths) {
      paths.push(path.resolve(p));
    }
  }
  if (paths.length === 0) {
    paths.push(path.resolve('.'));
  }
  return paths;
}
