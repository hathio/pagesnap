#!/usr/bin/env node

const { program } = require('commander');
const { loadConfig, initConfig } = require('./config');
const { captureSnapshots } = require('./capture');
const { promoteToBaseline, listSnapshots } = require('./snapshot');
const { diffSnapshots } = require('./diff');
const { generateReport, printReport } = require('./report');

program
  .name('pagesnap')
  .description('Capture and diff web page screenshots across deploys')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize pagesnap config in current directory')
  .action(async () => {
    try {
      await initConfig();
      console.log('✓ Created pagesnap.config.json');
    } catch (err) {
      console.error('Failed to init config:', err.message);
      process.exit(1);
    }
  });

program
  .command('capture')
  .description('Capture screenshots of all configured pages')
  .option('--baseline', 'Save captures directly as baseline')
  .action(async (opts) => {
    try {
      const config = await loadConfig();
      const snapshots = await captureSnapshots(config);
      if (opts.baseline) {
        for (const snap of snapshots) await promoteToBaseline(snap);
        console.log(`✓ Captured and saved ${snapshots.length} baseline snapshots`);
      } else {
        console.log(`✓ Captured ${snapshots.length} snapshots`);
      }
    } catch (err) {
      console.error('Capture failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('diff')
  .description('Diff current snapshots against baseline')
  .option('--report <path>', 'Write HTML report to path', 'pagesnap-report.html')
  .action(async (opts) => {
    try {
      const config = await loadConfig();
      const results = await diffSnapshots(config);
      printReport(results);
      await generateReport(results, opts.report);
      console.log(`✓ Report saved to ${opts.report}`);
      const hasDiffs = results.some(r => r.diffCount > 0);
      if (hasDiffs) process.exit(1);
    } catch (err) {
      console.error('Diff failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('promote')
  .description('Promote current snapshots to baseline')
  .action(async () => {
    try {
      const config = await loadConfig();
      const snapshots = await listSnapshots(config.snapshotDir, 'current');
      for (const snap of snapshots) await promoteToBaseline(snap);
      console.log(`✓ Promoted ${snapshots.length} snapshots to baseline`);
    } catch (err) {
      console.error('Promote failed:', err.message);
      process.exit(1);
    }
  });

program.parse();
