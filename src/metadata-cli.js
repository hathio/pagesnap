#!/usr/bin/env node
import { readMetadata, writeMetadata, deleteMetadata, listMetadata, findMetadataByTag } from './metadata.js';

const [,, cmd, ...args] = process.argv;

function printUsage() {
  console.log('Usage: metadata <cmd> [args]');
  console.log('  get <snapshotId>');
  console.log('  set <snapshotId> <key=value> ...');
  console.log('  delete <snapshotId>');
  console.log('  list [--tag <tag>]');
}

function parseKV(pairs) {
  const obj = {};
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx);
    const val = pair.slice(idx + 1);
    obj[key] = val;
  }
  return obj;
}

if (cmd === 'get') {
  const [id] = args;
  if (!id) { printUsage(); process.exit(1); }
  const meta = readMetadata(id);
  if (!meta) { console.error(`No metadata for: ${id}`); process.exit(1); }
  console.log(JSON.stringify(meta, null, 2));

} else if (cmd === 'set') {
  const [id, ...pairs] = args;
  if (!id || pairs.length === 0) { printUsage(); process.exit(1); }
  const existing = readMetadata(id) ?? {};
  const updates = parseKV(pairs);
  if (updates.tags) updates.tags = updates.tags.split(',').map((t) => t.trim());
  const record = writeMetadata(id, { ...existing, ...updates });
  console.log('Updated:', JSON.stringify(record, null, 2));

} else if (cmd === 'delete') {
  const [id] = args;
  if (!id) { printUsage(); process.exit(1); }
  deleteMetadata(id);
  console.log(`Deleted metadata for: ${id}`);

} else if (cmd === 'list') {
  const tagIdx = args.indexOf('--tag');
  const records = tagIdx !== -1
    ? findMetadataByTag(args[tagIdx + 1])
    : listMetadata();
  if (records.length === 0) { console.log('No metadata found.'); }
  else records.forEach((r) => console.log(`${r.snapshotId}\t${r.url ?? ''}\t[${(r.tags ?? []).join(', ')}]`));

} else {
  printUsage();
  process.exit(1);
}
