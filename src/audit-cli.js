import { readAuditLog, filterAuditLog, clearAuditLog } from './audit.js';

const USAGE = `
Usage: pagesnap audit <command> [options]

Commands:
  list              Print audit log entries
  clear             Clear the audit log

Options:
  --action <name>   Filter by action name
  --since <iso>     Filter entries after ISO timestamp
  --until <iso>     Filter entries before ISO timestamp
  --json            Output raw JSON lines
`.trim();

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--action') opts.action = argv[++i];
    else if (argv[i] === '--since') opts.since = argv[++i];
    else if (argv[i] === '--until') opts.until = argv[++i];
    else if (argv[i] === '--json') opts.json = true;
    else if (!opts.cmd) opts.cmd = argv[i];
  }
  return opts;
}

export function runAuditCli(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);

  if (!opts.cmd || opts.cmd === 'help') {
    console.log(USAGE);
    return;
  }

  if (opts.cmd === 'clear') {
    clearAuditLog();
    console.log('Audit log cleared.');
    return;
  }

  if (opts.cmd === 'list') {
    const all = readAuditLog();
    const entries = filterAuditLog(all, {
      action: opts.action,
      since: opts.since,
      until: opts.until,
    });
    if (entries.length === 0) {
      console.log('No audit entries found.');
      return;
    }
    for (const e of entries) {
      if (opts.json) {
        console.log(JSON.stringify(e));
      } else {
        console.log(`[${e.ts}] ${e.action}${e.page ? ' page=' + e.page : ''}${e.url ? ' url=' + e.url : ''}`);
      }
    }
    return;
  }

  console.error(`Unknown audit command: ${opts.cmd}`);
  process.exitCode = 1;
}
