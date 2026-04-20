const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-scli-'));
}

function run(args, cwd) {
  try {
    return execSync(`node ${path.resolve(__dirname, 'storage-cli.js')} ${args}`, {
      cwd,
      encoding: 'utf8',
      env: { ...process.env },
    });
  } catch (e) {
    return e.stdout + e.stderr;
  }
}

test('list shows no files message when empty', () => {
  const tmp = makeTmpDir();
  const out = run('list', tmp);
  expect(out).toMatch(/No files/);
});

test('stats shows zero files', () => {
  const tmp = makeTmpDir();
  const out = run('stats', tmp);
  expect(out).toMatch(/Files: 0/);
});

test('clean reports removed count', () => {
  const tmp = makeTmpDir();
  const storageDir = path.join(tmp, '.pagesnap');
  fs.mkdirSync(storageDir, { recursive: true });
  fs.writeFileSync(path.join(storageDir, 'a.png'), 'x');
  const out = run('clean', tmp);
  expect(out).toMatch(/Removed 1/);
});

test('unknown command shows usage', () => {
  const tmp = makeTmpDir();
  const out = run('bogus', tmp);
  expect(out).toMatch(/Usage/);
});
