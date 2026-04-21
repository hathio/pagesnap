import path from 'path';
import { loadConfig } from './config.js';
import {
  listRollbackPoints,
  saveRollbackPoint,
  rollbackBaseline,
  pruneRollbackPoints,
} from './rollback.js';

function printUsage() {
  console.log(`Usage: pagesnap rollback <command> [options]

Commands:
  list <name>              List rollback points for a snapshot
  save <name>              Save current baseline as a rollback point
  restore <name> <ts>      Restore baseline to a specific rollback point
  prune <name> [--keep N]  Remove old rollback points (default keep=5)
`);
}

export async function runRollbackCli(argv) {
  const [cmd, name, extra] = argv;
  if (!cmd || cmd === '--help') return printUsage();

  const config = await loadConfig();
  const snapshotDir = config.snapshotDir || '.pagesnap';

  if (cmd === 'list') {
    if (!name) return console.error('Error: name required');
    const points = listRollbackPoints(snapshotDir, name);
    if (!points.length) return console.log('No rollback points found.');
    for (const p of points) {
      console.log(`  ${p.timestamp}  ${new Date(p.timestamp).toISOString()}`);
    }
    return;
  }

  if (cmd === 'save') {
    if (!name) return console.error('Error: name required');
    const ts = saveRollbackPoint(snapshotDir, name);
    if (!ts) return console.log('No baseline found to save.');
    console.log(`Saved rollback point ${ts} for "${name}"`);
    return;
  }

  if (cmd === 'restore') {
    if (!name || !extra) return console.error('Error: name and timestamp required');
    const ts = parseInt(extra, 10);
    if (isNaN(ts)) return console.error('Error: invalid timestamp');
    rollbackBaseline(snapshotDir, name, ts);
    console.log(`Restored "${name}" to rollback point ${ts}`);
    return;
  }

  if (cmd === 'prune') {
    if (!name) return console.error('Error: name required');
    const keepFlag = argv.indexOf('--keep');
    const keep = keepFlag !== -1 ? parseInt(argv[keepFlag + 1], 10) : 5;
    const removed = pruneRollbackPoints(snapshotDir, name, keep);
    console.log(`Pruned ${removed} rollback point(s) for "${name}"`);
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  printUsage();
}
