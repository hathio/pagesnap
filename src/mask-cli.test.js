const { cmdValidate, cmdList } = require('./mask-cli');

function captureOutput(fn) {
  const logs = [];
  const errs = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errs.push(a.join(' '));
  let exitCode = null;
  const origExit = process.exit;
  process.exit = (code) => { exitCode = code; throw new Error(`exit:${code}`); };
  try { fn(); } catch (e) { if (!String(e.message).startsWith('exit:')) throw e; }
  finally {
    console.log = origLog;
    console.error = origErr;
    process.exit = origExit;
  }
  return { logs, errs, exitCode };
}

describe('cmdValidate', () => {
  test('valid region prints checkmark', () => {
    const { logs, exitCode } = captureOutput(() => cmdValidate(['0,0,300,60']));
    expect(logs[0]).toMatch('✓');
    expect(logs[0]).toMatch('rect(0,0,300x60)');
    expect(exitCode).toBeNull();
  });

  test('invalid region prints cross and exits 1', () => {
    const { errs, exitCode } = captureOutput(() => cmdValidate(['bad']));
    expect(errs[0]).toMatch('✗');
    expect(exitCode).toBe(1);
  });

  test('no args exits 1', () => {
    const { exitCode } = captureOutput(() => cmdValidate([]));
    expect(exitCode).toBe(1);
  });

  test('mixed valid/invalid exits 1', () => {
    const { logs, errs, exitCode } = captureOutput(() =>
      cmdValidate(['0,0,100,100', 'nope'])
    );
    expect(logs).toHaveLength(1);
    expect(errs).toHaveLength(1);
    expect(exitCode).toBe(1);
  });
});

describe('cmdList', () => {
  test('no args prints placeholder', () => {
    const { logs } = captureOutput(() => cmdList([]));
    expect(logs[0]).toMatch('no regions');
  });

  test('lists parsed regions', () => {
    const { logs } = captureOutput(() => cmdList(['5,10,200,80', '0,0,50,50']));
    expect(logs).toHaveLength(2);
    expect(logs[0]).toMatch('[0]');
    expect(logs[0]).toMatch('rect(5,10,200x80)');
    expect(logs[1]).toMatch('[1]');
  });

  test('invalid region exits 1', () => {
    const { exitCode } = captureOutput(() => cmdList(['1,2,3']));
    expect(exitCode).toBe(1);
  });
});
