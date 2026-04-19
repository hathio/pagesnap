const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Capture a screenshot of a URL and save it to the given output path.
 * @param {string} url
 * @param {string} outputPath
 * @param {object} options
 * @param {number} [options.width=1280]
 * @param {number} [options.height=800]
 * @param {number} [options.timeout=30000]
 */
async function captureScreenshot(url, outputPath, options = {}) {
  const { width = 1280, height = 800, timeout = 30000 } = options;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    await page.screenshot({ path: outputPath, fullPage: true });
  } finally {
    await browser.close();
  }

  return outputPath;
}

/**
 * Capture screenshots for all pages defined in config.
 * @param {object} config  loaded pagesnap config
 * @param {string} label   e.g. 'baseline' or 'current'
 * @param {string} snapshotDir  root dir to store snapshots
 */
async function captureAll(config, label, snapshotDir) {
  const results = [];
  for (const page of config.pages) {
    const safeName = page.name.replace(/[^a-z0-9_-]/gi, '_');
    const outputPath = path.join(snapshotDir, label, `${safeName}.png`);
    console.log(`  capturing ${page.name} -> ${outputPath}`);
    await captureScreenshot(page.url, outputPath, config.capture || {});
    results.push({ name: page.name, url: page.url, path: outputPath });
  }
  return results;
}

module.exports = { captureScreenshot, captureAll };
