const fs = require('fs');
const os = require('os');
const path = require('path');
const { captureAll } = require('./capture');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-capture-'));
}

// Minimal puppeteer mock
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setViewport: jest.fn().mockResolvedValue(),
      goto: jest.fn().mockResolvedValue(),
      screenshot: jest.fn().mockImplementation(({ path: p }) => {
        fs.writeFileSync(p, Buffer.alloc(10));
      }),
    }),
    close: jest.fn().mockResolvedValue(),
  }),
}));

describe('captureAll', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = makeTmpDir();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const config = {
    pages: [
      { name: 'home', url: 'http://localhost:3000/' },
      { name: 'about us', url: 'http://localhost:3000/about' },
    ],
  };

  it('creates screenshot files for each page', async () => {
    const results = await captureAll(config, 'baseline', tmpDir);
    expect(results).toHaveLength(2);
    for (const r of results) {
      expect(fs.existsSync(r.path)).toBe(true);
    }
  });

  it('sanitizes page names in file paths', async () => {
    const results = await captureAll(config, 'baseline', tmpDir);
    const aboutResult = results.find((r) => r.name === 'about us');
    expect(aboutResult.path).toMatch(/about_us\.png$/);
  });

  it('places files under the correct label directory', async () => {
    const results = await captureAll(config, 'current', tmpDir);
    for (const r of results) {
      expect(r.path).toContain(path.join(tmpDir, 'current'));
    }
  });
});
