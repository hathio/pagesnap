const { runWaitForCli, cmdList, cmdValidate, cmdScript, cmdDescribe } = require('./screenshot-waitfor-cli');

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
  return { logs, errors, threw };
}

test('list prints all wait types', () => {
  const { logs } = captureOutput(() => cmdList());
  const out = logs.join('\n');
  expect(out).toContain('selector');
  expect(out).toContain('network');
  expect(out).toContain('timeout');
  expect(out).toContain('function');
});

test('describe selector', () => {
  const { logs } = captureOutput(() => cmdDescribe('selector'));
  expect(logs.join('\n')).toContain('selector');
});

test('describe unknown type exits', () => {
  const origExit = process.exit;
  let code;
  process.exit = (c) => { code = c; throw new Error('exit'); };
  const { threw } = captureOutput(() => cmdDescribe('bogus'));
  process.exit = origExit;
  expect(code).toBe(1);
});

test('validate valid selector condition', () => {
  const { logs } = captureOutput(() => cmdValidate(JSON.stringify({ type: 'selector', selector: '#main' })));
  expect(logs.join('\n')).toContain('Valid');
});

test('validate invalid json exits', () => {
  const origExit = process.exit;
  let code;
  process.exit = (c) => { code = c; throw new Error('exit'); };
  captureOutput(() => cmdValidate('not-json'));
  process.exit = origExit;
  expect(code).toBe(1);
});

test('validate bad condition exits', () => {
  const origExit = process.exit;
  let code;
  process.exit = (c) => { code = c; throw new Error('exit'); };
  captureOutput(() => cmdValidate(JSON.stringify({ type: 'selector' })));
  process.exit = origExit;
  expect(code).toBe(1);
});

test('script outputs puppeteer code for timeout', () => {
  const { logs } = captureOutput(() => cmdScript(JSON.stringify({ type: 'timeout', timeout: 1000 })));
  expect(logs.join('\n')).toContain('setTimeout');
});

test('runWaitForCli unknown command exits', () => {
  const origExit = process.exit;
  let code;
  process.exit = (c) => { code = c; throw new Error('exit'); };
  captureOutput(() => runWaitForCli(['unknown']));
  process.exit = origExit;
  expect(code).toBe(1);
});

test('runWaitForCli no args prints usage', () => {
  const { logs } = captureOutput(() => runWaitForCli([]));
  expect(logs.join('\n')).toContain('Usage');
});
