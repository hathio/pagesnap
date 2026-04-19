const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI = path.resolve(__dirname, 'cli.js');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-cli-'));
}

function run(args, cwd) {
  return execSync(`node ${CLI} ${args}`, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, PAGESNAP_TEST: '1' }
  });
}

describe('cli', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('shows help output', () => {
    const out = run('--help', tmpDir);
    expect(out).toContain('pagesnap');
    expect(out).toContain('capture');
    expect(out).toContain('diff');
    expect(out).toContain('promote');
  });

  test('shows version', () => {
    const out = run('--version', tmpDir);
    expect(out.trim()).toMatch(/\d+\.\d+\.\d+/);
  });

  test('init creates config file', () => {
    const out = run('init', tmpDir);
    expect(out).toContain('pagesnap.config.json');
    const configPath = path.join(tmpDir, 'pagesnap.config.json');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('init fails if config already exists', () => {
    run('init', tmpDir);
    expect(() => run('init', tmpDir)).toThrow();
  });
});
