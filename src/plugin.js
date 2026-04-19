import path from 'path';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);

/**
 * Load a plugin by name or path.
 * Plugins export { beforeCapture, afterCapture, beforeDiff, afterDiff }
 */
export function loadPlugin(nameOrPath, rootDir = process.cwd()) {
  let resolved;
  if (nameOrPath.startsWith('.') || path.isAbsolute(nameOrPath)) {
    resolved = path.resolve(rootDir, nameOrPath);
  } else {
    resolved = require.resolve(nameOrPath, { paths: [rootDir] });
  }

  if (!fs.existsSync(resolved)) {
    throw new Error(`Plugin not found: ${nameOrPath}`);
  }

  const plugin = require(resolved);
  return normalizePlugin(plugin);
}

function normalizePlugin(raw) {
  const hooks = ['beforeCapture', 'afterCapture', 'beforeDiff', 'afterDiff'];
  const plugin = {};
  for (const hook of hooks) {
    plugin[hook] = typeof raw[hook] === 'function' ? raw[hook] : null;
  }
  plugin.name = raw.name || 'unnamed-plugin';
  return plugin;
}

export async function runPluginHook(plugins, hookName, context) {
  for (const plugin of plugins) {
    if (typeof plugin[hookName] === 'function') {
      await plugin[hookName](context);
    }
  }
}

export function loadPlugins(pluginList = [], rootDir = process.cwd()) {
  return pluginList.map((entry) => {
    const nameOrPath = typeof entry === 'string' ? entry : entry.name || entry.path;
    const plugin = loadPlugin(nameOrPath, rootDir);
    const options = typeof entry === 'object' ? entry.options || {} : {};
    return { ...plugin, options };
  });
}
