#!/usr/bin/env node
const path = require('path');
const { getStorageRoot, listFiles, deleteFile, storageStat } = require('./storage');

const [,, cmd, ...args] = process.argv;

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function cmdList() {
  const root = getStorageRoot();
  const files = listFiles(root);
  if (!files.length) { console.log('No files in storage.'); return; }
  files.forEach(f => {
    const stat = storageStat(f);
    console.log(`${path.relative(root, f)}  ${humanSize(stat.size)}`);
  });
}

function cmdStats() {
  const root = getStorageRoot();
  const files = listFiles(root);
  const total = files.reduce((sum, f) => {
    const s = storageStat(f);
    return sum + (s ? s.size : 0);
  }, 0);
  console.log(`Files: ${files.length}`);
  console.log(`Total size: ${humanSize(total)}`);
  console.log(`Storage root: ${root}`);
}

function cmdClean() {
  const root = getStorageRoot();
  const files = listFiles(root);
  let removed = 0;
  files.forEach(f => {
    if (deleteFile(f)) removed++;
  });
  console.log(`Removed ${removed} file(s).`);
}

const commands = { list: cmdList, stats: cmdStats, clean: cmdClean };

if (!cmd || !commands[cmd]) {
  console.log('Usage: storage-cli <list|stats|clean>');
  process.exit(1);
}

commands[cmd]();
