import fs from 'fs';
import path from 'path';

export function generateReport(diffResults, outputDir) {
  const timestamp = new Date().toISOString();
  const passed = diffResults.filter(r => !r.changed);
  const failed = diffResults.filter(r => r.changed);

  const report = {
    timestamp,
    summary: {
      total: diffResults.length,
      passed: passed.length,
      failed: failed.length,
    },
    results: diffResults.map(r => ({
      page: r.page,
      changed: r.changed,
      diffPercent: r.diffPercent ?? null,
      baselinePath: r.baselinePath ?? null,
      currentPath: r.currentPath ?? null,
      diffPath: r.diffPath ?? null,
    })),
  };

  fs.mkdirSync(outputDir, { recursive: true });
  const jsonPath = path.join(outputDir, 'report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  return { report, jsonPath };
}

export function printReport(report) {
  const { summary, results } = report;
  console.log(`\nPageSnap Report — ${report.timestamp}`);
  console.log(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed}\n`);

  for (const r of results) {
    const status = r.changed ? '✗ CHANGED' : '✓ ok';
    const pct = r.diffPercent != null ? ` (${r.diffPercent.toFixed(2)}% diff)` : '';
    console.log(`  ${status}  ${r.page}${pct}`);
  }

  if (summary.failed > 0) {
    console.log(`\n${summary.failed} page(s) changed.`);
  } else {
    console.log('\nAll pages match baseline.');
  }
}
