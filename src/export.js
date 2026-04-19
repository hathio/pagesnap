import fs from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

export async function exportSnapshots(snapshotDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve({ bytes: archive.pointer(), path: outputPath }));
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(snapshotDir, false);
    archive.finalize();
  });
}

export function buildExportManifest(snapshots, meta = {}) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    count: snapshots.length,
    snapshots,
    ...meta,
  };
}

export async function writeManifest(dir, manifest) {
  const manifestPath = path.join(dir, 'manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

export function resolveExportPath(outputDir, label) {
  const slug = label ? label.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'export';
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(outputDir, `pagesnap-${slug}-${ts}.zip`);
}
