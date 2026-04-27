const { runNetworkCli, cmdList, cmdDescribe, cmdValidate, cmdScript } = require('./screenshot-network-cli');

function captureOutput(fn) {
  const logs = [];
  const errs = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errs.push(a.join(' '));
  try { fn(); } catch (e) { /* ignore */ }
  finally {
    console.log = origLog;
    console.error = origErr;
  }
  return { logs, errs };
}

test('runNetworkCli prints usage with no args', () => {
  const { logs } = captureOutput(() => runNetworkCli([]));
  expect(logs.join('\n')).toContain('Usage');
});

test('cmdList prints all presets', () => {
  const { logs } = captureOutput(() => cmdList());
  const out = logs.join('\n');
  expect(out).toContain('fast3g');
  expect(out).toContain('slow3g');
  expect(out).toContain('offline');
  expect(out).toContain('broadband');
});

test('cmdList shows throughput and latency info', () => {
  const { logs } = captureOutput(() => cmdList());
  const out = logs.join('\n');
  expect(out).toContain('kbps');
  expect(out).toContain('latency');
});

test('cmdDescribe prints preset info', () => {
  const { logs } = captureOutput(() => cmdDescribe('slow3g'));
  const out = logs.join('\n');
  expect(out).toContain('slow3g');
  expect(out).toContain('latency');
});

test('cmdDescribe errors on unknown preset', () => {
  const { errs } = captureOutput(() => {
    try { cmdDescribe('nonexistent'); } catch {}
  });
  expect(errs.join(' ')).toContain('Unknown');
});

test('cmdValidate accepts valid JSON preset object', () => {
  const { logs } = captureOutput(() => cmdValidate(JSON.stringify({ preset: 'fast3g' })));
  expect(logs.join(' ')).toContain('Valid');
});

test('cmdValidate rejects invalid JSON', () => {
  const { errs } = captureOutput(() => {
    try { cmdValidate('not-json'); } catch {}
  });
  expect(errs.join(' ')).toContain('Invalid JSON');
});

test('cmdScript prints emulateNetworkConditions for valid preset', () => {
  const { logs } = captureOutput(() => cmdScript('2g'));
  expect(logs.join('\n')).toContain('emulateNetworkConditions');
});

test('runNetworkCli dispatches list command', () => {
  const { logs } = captureOutput(() => runNetworkCli(['list']));
  expect(logs.join('\n')).toContain('fast3g');
});

test('runNetworkCli dispatches script command', () => {
  const { logs } = captureOutput(() => runNetworkCli(['script', 'broadband']));
  expect(logs.join('\n')).toContain('emulateNetworkConditions');
});
