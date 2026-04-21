import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.json': 'application/json',
};

export function startReportServer(reportDir, port = 3000) {
  const server = createServer(async (req, res) => {
    let urlPath = req.url === '/' ? '/index.html' : req.url;

    // Strip query strings to avoid path traversal or file lookup issues
    urlPath = urlPath.split('?')[0];

    const filePath = path.join(reportDir, urlPath);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(path.resolve(reportDir))) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Report server running at http://localhost:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

export function stopServer(server) {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
