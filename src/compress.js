import fs from 'fs';
import path from 'path';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

export function getCompressedPath(filePath) {
  return filePath + '.gz';
}

export async function compressFile(filePath) {
  const dest = getCompressedPath(filePath);
  await pipeline(
    createReadStream(filePath),
    createGzip(),
    createWriteStream(dest)
  );
  return dest;
}

export async function decompressFile(compressedPath, destPath) {
  await pipeline(
    createReadStream(compressedPath),
    createGunzip(),
    createWriteStream(destPath)
  );
  return destPath;
}

export async function compressDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.png'))
    .map(f => path.join(dirPath, f));

  const results = [];
  for (const file of files) {
    const out = await compressFile(file);
    results.push(out);
  }
  return results;
}

export function isCompressed(filePath) {
  return filePath.endsWith('.gz');
}
