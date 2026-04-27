const { runMediaCli } = require('./screenshot-media-cli');

function captureOutput(fn) {
  const logs = [];
  const errs = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...a) => logs.push(a.join(' '));
  console.error = (...a) => errs.push(a.join(' '));
  let threw = null;
  try { fn(); } catch (e) { threw = e; }
  console.log = origLog;
  console.error = origErr;
  return { logs: logs.join('\n'), errs: errs.join('\n'), threw };
}

describe('media CLI list', () => {
  test('lists presets', () => {
    const { logs } = captureOutput(() => runMediaCli(['list']));
    expect(logs).toContain('screen');
    expect(logs).toContain('print');
    expect(logs).toContain('accessible');
  });
});

describe('media CLI describe', () => {
  test('describes print preset', () => {
    const { logs } = captureOutput(() => runMediaCli(['describe', 'print']));
    expect(logs).toContain('print');
  });

  test('errors on unknown preset', () => {
    const { errs } = captureOutput(() => runMediaCli(['describe', 'unknown']));
    expect(errs).toContain('Unknown media preset');
  });
});

describe('media CLI validate', () => {
  test('validates screen type', () => {
    const { logs } = captureOutput(() => runMediaCli(['validate', '--type', 'screen']));
    expect(logs).toContain('Valid');
  });

  test('rejects invalid type', () => {
    const { errs } = captureOutput(() => runMediaCli(['validate', '--type', 'laser']));
    expect(errs).toContain('Invalid');
  });

  test('validates reduced motion flag', () => {
    const { logs } = captureOutput(() => runMediaCli(['validate', '--reduced-motion']));
    expect(logs).toContain('reduced-motion');
  });
});

describe('media CLI script', () => {
  test('outputs no-op comment for defaults', () => {
    const { logs } = captureOutput(() => runMediaCli(['script']));
    expect(logs).toContain('no browser script needed');
  });

  test('outputs emulateMediaType for print', () => {
    const { logs } = captureOutput(() => runMediaCli(['script', '--type', 'print']));
    expect(logs).toContain('emulateMediaType');
  });

  test('outputs reduced-motion script', () => {
    const { logs } = captureOutput(() => runMediaCli(['script', '--reduced-motion']));
    expect(logs).toContain('prefers-reduced-motion');
  });

  test('uses preset flag', () => {
    const { logs } = captureOutput(() => runMediaCli(['script', '--preset', 'accessible']));
    expect(logs).toContain('prefers-reduced-motion');
  });
});

describe('media CLI default', () => {
  test('prints usage for unknown command', () => {
    const { logs } = captureOutput(() => runMediaCli(['foobar']));
    expect(logs).toContain('Usage');
  });
});
