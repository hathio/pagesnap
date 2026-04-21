import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addTag } from './tag.js';
import { runTagCli } from './tag-cli.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-tagcli-'));
}

vi.mock('./storage.js', async (importOriginal) => {
  const actual = await importOriginal();
  let _root = os.tmpdir();
  return {
    ...actual,
    getStorageRoot: () => _root,
    ensureDir: actual.ensureDir,
  };
});

function run(argv) {
  const logs = [];
  const spy = vi.spyOn(console, 'log').mockImplementation(m => logs.push(m));
  runTagCli(argv);
  spy.mockRestore();
  return logs;
}

describe('tag-cli', () => {
  it('shows usage for unknown command', () => {
    const out = run(['unknown']);
    expect(out.join('\n')).toMatch(/Usage/);
  });

  it('add command prints tag list', () => {
    const out = run(['add', 'snap-abc', 'release']);
    expect(out[0]).toMatch(/snap-abc/);
    expect(out[0]).toMatch(/release/);
  });

  it('list command shows tags', () => {
    run(['add', 'snap-xyz', 'beta']);
    const out = run(['list', 'snap-xyz']);
    expect(out[0]).toMatch(/beta/);
  });

  it('list command shows (no tags) for unknown snapshot', () => {
    const out = run(['list', 'snap-nope-99999']);
    expect(out[0]).toBe('(no tags)');
  });

  it('all command lists tags', () => {
    run(['add', 'snap-1', 'mytag']);
    const out = run(['all']);
    expect(out.some(l => l.includes('mytag'))).toBe(true);
  });
});
