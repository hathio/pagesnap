import fs from 'fs';
import os from 'os';
import path from 'path';
import { generateReport, printReport } from './report.js';

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-report-'));
}

const mockResults = [
  { page: '/index', changed: false, diffPercent: 0 },
  { page: '/about', changed: true, diffPercent: 12.5, diffPath: '/tmp/about.diff.png' },
];

describe('generateReport', () => {
  test('writes report.json to outputDir', () => {
    const dir = makeTmpDir();
    const { jsonPath, report } = generateReport(mockResults, dir);
    expect(fs.existsSync(jsonPath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(parsed.summary.total).toBe(2);
    expect(parsed.summary.failed).toBe(1);
    expect(parsed.summary.passed).toBe(1);
  });

  test('report contains all result fields', () => {
    const dir = makeTmpDir();
    const { report } = generateReport(mockResults, dir);
    expect(report.results[1].page).toBe('/about');
    expect(report.results[1].changed).toBe(true);
    expect(report.results[1].diffPercent).toBeCloseTo(12.5);
  });

  test('creates outputDir if missing', () => {
    const dir = path.join(makeTmpDir(), 'nested', 'report');
    const { jsonPath } = generateReport(mockResults, dir);
    expect(fs.existsSync(jsonPath)).toBe(true);
  });
});

describe('printReport', () => {
  test('prints without throwing', () => {
    const dir = makeTmpDir();
    const { report } = generateReport(mockResults, dir);
    expect(() => printReport(report)).not.toThrow();
  });
});
