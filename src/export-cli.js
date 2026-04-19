import path from 'path';
import fs from 'fs';
import { loadConfig } from './config.js';
import { listSnapshots, getSnapshotDir } from './snapshot.js';
import { exportSnapshots, buildExportManifest, writeManifest, resolveExportPath } from './export.js';

export async function runExport(argv) {
  const config = await loadConfig();
  const label = argv.label || '';
  const outputDir = argv.out ? path.resolve(argv.out) : process.cwd();

  fs.mkdirSync(outputDir, { recursive: true });

  const snapshotDir = getSnapshotDir(config);
  const snapshots = await listSnapshots(config);

  if (snapshots.length === 0) {
    console.log('No snapshots found to export.');
    return;
  }

  const manifest = buildExportManifest(snapshots, { label });
  await writeManifest(snapshotDir, manifest);

  const outputPath = resolveExportPath(outputDir, label);
  const result = await exportSnapshots(snapshotDir, outputPath);

  console.log(`Exported ${snapshots.length} snapshot(s) to ${result.path}`);
  console.log(`Archive size: ${(result.bytes / 1024).toFixed(1)} KB`);
}
