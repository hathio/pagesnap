const { runEmulateCli, cmdList, cmdDescribe, cmdValidate, cmdScript } = require('./screenshot-emulate-cli');

function captureOutput(fn) {
  const logs = [];
  const errors = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errors.push(a.join(' '));
  let threw = null;
  try { fn(); } catch (e) { threw = e; }
  console.log = origLog;
  console.error = origErr;
  return { logs: logs.join('\n'), errors: errors.join('\n'), threw };
}

describe('cmdList', () => {
  test('outputs preset names', () => {
    const { logs } = captureOutput(() => cmdList());
    expect(logs).toContain('iphone-14');
    expect(logs).toContain('pixel-7');
    expect(logs).toContain('desktop-hd');
  });

  test('shows dimensions', () => {
    const { logs } = captureOutput(() => cmdList());
    expect(logs).toContain('390x844');
  });
});

describe('cmdDescribe', () => {
  test('describes known preset', () => {
    const { logs } = captureOutput(() => cmdDescribe('ipad-pro'));
    expect(logs).toContain('ipad-pro');
  });

  test('exits on unknown preset', () => {
    const origExit = process.exit;
    let code;
    process.exit = (c) => { code = c; throw new Error('exit'); };
    const { threw } = captureOutput(() => cmdDescribe('nonexistent'));
    process.exit = origExit;
    expect(code).toBe(1);
  });

  test('exits when no name given', () => {
    const origExit = process.exit;
    let code;
    process.exit = (c) => { code = c; throw new Error('exit'); };
    captureOutput(() => cmdDescribe(undefined));
    process.exit = origExit;
    expect(code).toBe(1);
  });
});

describe('cmdValidate', () => {
  test('validates correct JSON', () => {
    const { logs } = captureOutput(() => cmdValidate('{"preset":"galaxy-s21"}'));
    expect(logs).toContain('Valid');
  });

  test('rejects invalid JSON', () => {
    const origExit = process.exit;
    let code;
    process.exit = (c) => { code = c; throw new Error('exit'); };
    captureOutput(() => cmdValidate('not json'));
    process.exit = origExit;
    expect(code).toBe(1);
  });
});

describe('cmdScript', () => {
  test('outputs script for preset', () => {
    const { logs } = captureOutput(() => cmdScript('{"preset":"iphone-14"}'));
    expect(logs).toContain('setViewport');
  });

  test('outputs no-op comment for empty options', () => {
    const { logs } = captureOutput(() => cmdScript('{}'));
    expect(logs).toContain('no emulation script');
  });
});
