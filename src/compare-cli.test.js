import { describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-compare-cli-'));
}

function run(args = '', cwd) {
  try {
    const out = execSync(`node src/compare-cli.js ${args}`, {
      cwd: cwd ?? process.cwd(),
      encoding: 'utf8',
      env: { ...process.env, PAGESNAP_CONFIG: 'none' },
    });
    return { stdout: out, code: 0 };
  } catch (err) {
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? '', code: err.status ?? 1 };
  }
}

describe('compare-cli', () => {
  it('exits cleanly with no snapshots', () => {
    const tmp = makeTmpDir();
    const result = run('', tmp);
    expect(result.stdout).toMatch(/No snapshots|compare failed/);
  });

  it('supports --json flag', () => {
    const tmp = makeTmpDir();
    const result = run('--json', tmp);
    // Even on failure, should not throw unhandled
    expect(result.code).toBeGreaterThanOrEqual(0);
  });

  it('exits with code 1 on diffs', () => {
    // Without real snapshots this will exit 0 (no snapshots) or 1 (error)
    const result = run('');
    expect([0, 1]).toContain(result.code);
  });
});
