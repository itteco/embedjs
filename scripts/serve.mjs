// Tiny static server for the demo pages and Playwright e2e tests.
// Serves the repo root so /dist and /demo resolve as they do in production.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
const port = Number(process.env.PORT) || 8917;

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css',
    '.json': 'application/json',
    '.map': 'application/json'
};

createServer(async (req, res) => {
    try {
        const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        let filePath = normalize(join(root, urlPath));
        if (!filePath.startsWith(root)) {
            res.writeHead(403).end();
            return;
        }
        if (urlPath === '/') {
            filePath = join(root, 'demo/index.html');
        }
        const data = await readFile(filePath);
        res.writeHead(200, { 'content-type': mime[extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    } catch {
        res.writeHead(404).end('not found');
    }
}).listen(port, () => console.warn(`serving ${root} on http://localhost:${port}`));
