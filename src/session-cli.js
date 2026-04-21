import { createSession, readSession, closeSession, deleteSession, listSessions } from './session.js';

const USAGE = `
Usage: pagesnap session <command> [options]

Commands:
  create [--label <name>]   Start a new session
  show <id>                 Show session details
  close <id>                Mark session as closed
  delete <id>               Remove session record
  list                      List all sessions
`.trim();

function printSession(s) {
  console.log(`id:        ${s.id}`);
  console.log(`status:    ${s.status}`);
  console.log(`createdAt: ${s.createdAt}`);
  if (s.updatedAt) console.log(`updatedAt: ${s.updatedAt}`);
  if (s.label) console.log(`label:     ${s.label}`);
}

export async function runSessionCli(argv = process.argv.slice(2)) {
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(USAGE);
    return;
  }

  if (cmd === 'create') {
    const labelIdx = rest.indexOf('--label');
    const label = labelIdx !== -1 ? rest[labelIdx + 1] : undefined;
    const session = await createSession(label ? { label } : {});
    console.log(`Session created: ${session.id}`);
    printSession(session);
    return;
  }

  if (cmd === 'show') {
    const id = rest[0];
    if (!id) { console.error('Error: session id required'); process.exitCode = 1; return; }
    const session = await readSession(id);
    if (!session) { console.error(`Session not found: ${id}`); process.exitCode = 1; return; }
    printSession(session);
    return;
  }

  if (cmd === 'close') {
    const id = rest[0];
    if (!id) { console.error('Error: session id required'); process.exitCode = 1; return; }
    const session = await closeSession(id);
    console.log(`Session closed: ${session.id}`);
    return;
  }

  if (cmd === 'delete') {
    const id = rest[0];
    if (!id) { console.error('Error: session id required'); process.exitCode = 1; return; }
    await deleteSession(id);
    console.log(`Session deleted: ${id}`);
    return;
  }

  if (cmd === 'list') {
    const sessions = await listSessions();
    if (sessions.length === 0) { console.log('No sessions found.'); return; }
    for (const s of sessions) {
      console.log(`${s.id}  ${s.status.padEnd(8)}  ${s.createdAt}${s.label ? '  ' + s.label : ''}`);
    }
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  process.exitCode = 1;
}
