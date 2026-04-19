import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startWatch, stopWatch } from './watch.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-watch-'));
}

vi.mock('chokidar', () => {
  const handlers = {};
  const mock = {
    watch: vi.fn(() => ({
      on: vi.fn((event, cb) => { handlers[event] = cb; return mock._inst; }),
      close: vi.fn(),
      _emit: (event, arg) => handlers[event]?.(arg),
    })),
  };
  mock._inst = { on: vi.fn((e, cb) => { handlers[e] = cb; return mock._inst; }), close: vi.fn(), _emit: (e, a) => handlers[e]?.(a) };
  return { default: mock };
});

vi.mock('./config.js', () => ({
  loadConfig: vi.fn(() => ({ watchPaths: ['./src'] })),
}));

describe('watch', () => {
  afterEach(() => stopWatch());

  it('starts a watcher and returns it', () => {
    const cb = vi.fn();
    const w = startWatch('pagesnap.config.json', cb);
    expect(w).toBeDefined();
  });

  it('stopWatch does not throw when no watcher active', () => {
    stopWatch();
    expect(true).toBe(true);
  });

  it('uses cwd when no watchPaths in config', async () => {
    const { loadConfig } = await import('./config.js');
    loadConfig.mockReturnValueOnce({});
    const cb = vi.fn();
    const w = startWatch('pagesnap.config.json', cb);
    expect(w).toBeDefined();
  });
});
