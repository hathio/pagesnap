const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadConfig, initConfig, defaults, CONFIG_FILENAME } = require('./config');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-test-'));
}

describe('loadConfig', () => {
  test('returns defaults when no config file exists', () => {
    const dir = makeTmpDir();
    const config = loadConfig(dir);
    expect(config).toEqual(defaults);
  });

  test('merges user config with defaults', () => {
    const dir = makeTmpDir();
    const userConfig = { baseUrl: 'https://example.com', pages: ['/home'] };
    fs.writeFileSync(path.join(dir, CONFIG_FILENAME), JSON.stringify(userConfig));

    const config = loadConfig(dir);
    expect(config.baseUrl).toBe('https://example.com');
    expect(config.pages).toEqual(['/home']);
    expect(config.outputDir).toBe(defaults.outputDir);
    expect(config.threshold).toBe(defaults.threshold);
  });

  test('throws on invalid JSON', () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, CONFIG_FILENAME), 'not json {{');
    expect(() => loadConfig(dir)).toThrow('Failed to parse');
  });

  test('does not mutate the defaults object', () => {
    const dir = makeTmpDir();
    const userConfig = { baseUrl: 'https://example.com' };
    fs.writeFileSync(path.join(dir, CONFIG_FILENAME), JSON.stringify(userConfig));

    const before = { ...defaults };
    loadConfig(dir);
    expect(defaults).toEqual(before);
  });
});

describe('initConfig', () => {
  test('creates config file with starter content', () => {
    const dir = makeTmpDir();
    const filePath = initConfig(dir);
    expect(fs.existsSync(filePath)).toBe(true);

    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(parsed.pages).toContain('/');
    expect(Array.isArray(parsed.viewports)).toBe(true);
  });

  test('throws if config already exists', () => {
    const dir = makeTmpDir();
    initConfig(dir);
    expect(() => initConfig(dir)).toThrow('already exists');
  });
});
