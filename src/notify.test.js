const fs = require('fs');
const os = require('os');
const path = require('path');
const { notify, formatDiffSummary, writeNotifyLog } = require('./notify');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-notify-'));
}

const sampleResults = [
  { url: 'http://localhost/a', diffPercent: 0 },
  { url: 'http://localhost/b', diffPercent: 12.5 },
  { url: 'http://localhost/c', error: 'timeout' },
];

test('formatDiffSummary includes totals', () => {
  const msg = formatDiffSummary(sampleResults);
  expect(msg).toMatch('3 page(s) checked');
  expect(msg).toMatch('1 page(s) changed');
  expect(msg).toMatch('1 page(s) errored');
});

test('formatDiffSummary no changes', () => {
  const msg = formatDiffSummary([{ url: 'http://localhost/', diffPercent: 0 }]);
  expect(msg).toMatch('No visual changes');
});

test('writeNotifyLog creates and appends log', () => {
  const dir = makeTmpDir();
  const logPath = path.join(dir, 'notify.log.json');
  writeNotifyLog(logPath, sampleResults);
  const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  expect(data).toHaveLength(1);
  expect(data[0].summary).toHaveLength(3);
  writeNotifyLog(logPath, sampleResults);
  const data2 = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  expect(data2).toHaveLength(2);
});

test('notify writes log when logFile configured', async () => {
  const dir = makeTmpDir();
  const logPath = path.join(dir, 'out.json');
  const config = { notify: { logFile: logPath } };
  const msg = await notify(config, sampleResults);
  expect(msg).toMatch('3 page(s)');
  expect(fs.existsSync(logPath)).toBe(true);
});

test('notify does nothing extra when no notify config', async () => {
  const msg = await notify({}, sampleResults);
  expect(msg).toBeTruthy();
});
