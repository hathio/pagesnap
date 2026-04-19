#!/usr/bin/env node
const { loadConfig } = require('./config');
const { copyToBaseline, deleteBaseline, listBaselines, hasBaseline } = require('./baseline');
const { ensureSnapshotDirs } = require('./snapshot');

async function run(argv) {
  const config = await loadConfig();
  const snapshotsDir = config.snapshotsDir || 'snapshots';
  ensureSnapshotDirs(snapshotsDir);

  const [cmd, name] = argv;

  if (cmd === 'list') {
    const baselines = listBaselines(snapshotsDir);
    if (baselines.length === 0) {
      console.log('No baselines found.');
    } else {
      baselines.forEach(b => console.log(b));
    }
    return;
  }

  if (cmd === 'promote') {
    if (!name) { console.error('Usage: baseline promote <name|all>'); process.exit(1); }
    const targets = name === 'all' ? listBaselines(snapshotsDir) : [name];
    for (const t of targets) {
      copyToBaseline(t, snapshotsDir);
      console.log(`Promoted ${t} to baseline`);
    }
    return;
  }

  if (cmd === 'delete') {
    if (!name) { console.error('Usage: baseline delete <name>'); process.exit(1); }
    if (!hasBaseline(name, snapshotsDir)) {
      console.error(`No baseline found for: ${name}`);
      process.exit(1);
    }
    deleteBaseline(name, snapshotsDir);
    console.log(`Deleted baseline: ${name}`);
    return;
  }

  console.error('Commands: list | promote <name|all> | delete <name>');
  process.exit(1);
}

run(process.argv.slice(2)).catch(e => { console.error(e.message); process.exit(1); });
