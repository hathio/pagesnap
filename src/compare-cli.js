#!/usr/bin/env node
import { compareAll, summarizeComparison } from './compare.js';
import { listSnapshots, getSnapshotDir } from './snapshot.js';
import { loadConfig } from './config.js';
import { filterSnapshots, parseFilterArgs } from './filter.js';
import { generateReport, printReport } from './report.js';

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));

async function main() {
  const config = await loadConfig();
  const snapshotDir = getSnapshotDir(config, 'current');

  let names = listSnapshots(snapshotDir);

  const filterArgs = parseFilterArgs(positional);
  if (filterArgs.length > 0) {
    names = filterSnapshots(names, filterArgs);
  }

  if (names.length === 0) {
    console.log('No snapshots to compare.');
    process.exit(0);
  }

  const threshold = config.diffThreshold ?? 0.01;
  const results = await compareAll(names, snapshotDir, { threshold });
  const summary = summarizeComparison(results);

  if (flags.has('--json')) {
    console.log(JSON.stringify({ summary, results }, null, 2));
    process.exit(summary.diffed > 0 ? 1 : 0);
  }

  printReport(results, summary);

  if (flags.has('--report')) {
    const reportPath = await generateReport(results, summary, config);
    console.log(`Report saved to ${reportPath}`);
  }

  process.exit(summary.diffed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('compare failed:', err.message);
  process.exit(1);
});
