const fs = require('fs');
const path = require('path');

const CONFIG_FILENAME = 'pagesnap.config.json';

const defaults = {
  outputDir: '.pagesnap',
  baseUrl: 'http://localhost:3000',
  pages: [],
  threshold: 0.1,
  viewports: [
    { width: 1280, height: 800, name: 'desktop' }
  ]
};

function loadConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_FILENAME);

  if (!fs.existsSync(configPath)) {
    return { ...defaults };
  }

  let userConfig;
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    userConfig = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse ${CONFIG_FILENAME}: ${err.message}`);
  }

  return {
    ...defaults,
    ...userConfig,
    viewports: userConfig.viewports ?? defaults.viewports
  };
}

function initConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, CONFIG_FILENAME);

  if (fs.existsSync(configPath)) {
    throw new Error(`${CONFIG_FILENAME} already exists in ${cwd}`);
  }

  const starter = {
    baseUrl: 'http://localhost:3000',
    outputDir: '.pagesnap',
    threshold: 0.1,
    pages: ['/', '/about', '/contact'],
    viewports: [
      { width: 1280, height: 800, name: 'desktop' },
      { width: 375, height: 812, name: 'mobile' }
    ]
  };

  fs.writeFileSync(configPath, JSON.stringify(starter, null, 2));
  return configPath;
}

module.exports = { loadConfig, initConfig, CONFIG_FILENAME, defaults };
