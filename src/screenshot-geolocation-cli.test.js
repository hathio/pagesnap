const { runGeolocationCli, cmdList, cmdDescribe, cmdValidate } = require('./screenshot-geolocation-cli');

function captureOutput(fn) {
  const logs = [];
  const errs = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errs.push(a.join(' '));
  let exitCode = null;
  const origExit = process.exit;
  process.exit = (c) => { exitCode = c; throw new Error('exit:' + c); };
  try { fn(); } catch (e) { if (!String(e.message).startsWith('exit:')) throw e; }
  finally {
    console.log = origLog;
    console.error = origErr;
    process.exit = origExit;
  }
  return { logs: logs.join('\n'), errs: errs.join('\n'), exitCode };
}

test('list prints all preset names', () => {
  const { logs } = captureOutput(() => cmdList());
  expect(logs).toContain('london');
  expect(logs).toContain('tokyo');
  expect(logs).toContain('new-york');
});

test('describe with preset prints coordinates', () => {
  const { logs } = captureOutput(() => cmdDescribe('paris'));
  expect(logs).toContain('lat=');
  expect(logs).toContain('lng=');
});

test('describe with lat,lng string works', () => {
  const { logs } = captureOutput(() => cmdDescribe('40.7128,-74.006'));
  expect(logs).toContain('lat=40.7128');
});

test('describe with no value exits 1', () => {
  const { exitCode } = captureOutput(() => cmdDescribe(undefined));
  expect(exitCode).toBe(1);
});

test('describe with invalid value exits 1', () => {
  const { exitCode, errs } = captureOutput(() => cmdDescribe('not-a-place'));
  expect(exitCode).toBe(1);
  expect(errs).toContain('Error');
});

test('validate with valid preset exits cleanly', () => {
  const { exitCode, logs } = captureOutput(() => cmdValidate('sydney'));
  expect(exitCode).toBeNull();
  expect(logs).toContain('Valid');
});

test('validate with out-of-range lat exits 1', () => {
  const { exitCode, errs } = captureOutput(() => cmdValidate('91,0'));
  expect(exitCode).toBe(1);
  expect(errs).toContain('Invalid');
});

test('runGeolocationCli list command works', () => {
  const { logs } = captureOutput(() => runGeolocationCli(['list']));
  expect(logs).toContain('london');
});

test('runGeolocationCli unknown command prints usage and exits 1', () => {
  const { exitCode } = captureOutput(() => runGeolocationCli(['bogus']));
  expect(exitCode).toBe(1);
});
