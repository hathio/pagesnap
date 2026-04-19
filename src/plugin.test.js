import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadPlugin, runPluginHook, loadPlugins } from './plugin.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-plugin-'));
}

function writePlugin(dir, name, content) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, content);
  return file;
}

describe('loadPlugin', () => {
  it('loads a valid plugin from a relative path', () => {
    const dir = makeTmpDir();
    writePlugin(dir, 'myplugin.cjs', `module.exports = { name: 'myplugin', afterCapture: async () => {} };`);
    const plugin = loadPlugin('./myplugin.cjs', dir);
    expect(plugin.name).toBe('myplugin');
    expect(typeof plugin.afterCapture).toBe('function');
    expect(plugin.beforeCapture).toBeNull();
  });

  it('throws if plugin file does not exist', () => {
    const dir = makeTmpDir();
    expect(() => loadPlugin('./missing.cjs', dir)).toThrow('Plugin not found');
  });

  it('fills missing hooks with null', () => {
    const dir = makeTmpDir();
    writePlugin(dir, 'empty.cjs', `module.exports = { name: 'empty' };`);
    const plugin = loadPlugin('./empty.cjs', dir);
    expect(plugin.beforeCapture).toBeNull();
    expect(plugin.beforeDiff).toBeNull();
  });
});

describe('runPluginHook', () => {
  it('calls matching hook on each plugin', async () => {
    const calls = [];
    const plugins = [
      { name: 'a', beforeCapture: async (ctx) => calls.push(ctx.url), afterCapture: null, beforeDiff: null, afterDiff: null },
      { name: 'b', beforeCapture: async (ctx) => calls.push(ctx.url + '2'), afterCapture: null, beforeDiff: null, afterDiff: null },
    ];
    await runPluginHook(plugins, 'beforeCapture', { url: 'http://example.com' });
    expect(calls).toEqual(['http://example.com', 'http://example.com2']);
  });

  it('skips plugins without the hook', async () => {
    const plugins = [{ name: 'x', beforeCapture: null }];
    await expect(runPluginHook(plugins, 'beforeCapture', {})).resolves.toBeUndefined();
  });
});

describe('loadPlugins', () => {
  it('returns empty array for empty list', () => {
    expect(loadPlugins([])).toEqual([]);
  });

  it('loads plugins from array of path strings', () => {
    const dir = makeTmpDir();
    writePlugin(dir, 'plug.cjs', `module.exports = { name: 'plug', beforeDiff: async () => {} };`);
    const plugins = loadPlugins(['./plug.cjs'], dir);
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('plug');
  });
});
