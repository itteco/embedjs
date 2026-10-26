// Tiny static server for the demo pages and Playwright e2e tests.
// Serves the repo root so /dist and /demo resolve as they do in production.
//
// Demo pages use {{IFRAMELY_API_KEY}} placeholders in their script srcs;
// the server substitutes them from the environment or a git-ignored .env
// file at the repo root, falling back to 'TEST'. The key is injected only
// into locally served HTML and never written to disk. Since those pages
// carry the key, the server listens on loopback only and refuses dotfiles
// (see serve-path.mjs).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveUnderRoot } from './serve-path.mjs';

const root = normalize(join(dirname(fileURLToPath(import.meta.url)), '..'));
const port = Number(process.env.PORT) || 8917;

async function loadDotEnv() {
	try {
		const raw = await readFile(join(root, '.env'), 'utf8');
		for (const line of raw.split(/\r?\n/)) {
			const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
			if (m && !(m[1] in process.env)) {
				// real environment wins over .env
				process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
			}
		}
	} catch {
		// no .env — fall back to defaults
	}
}

await loadDotEnv();
const apiKey = process.env.IFRAMELY_API_KEY || 'TEST';

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
		let filePath = resolveUnderRoot(root, urlPath);
		if (filePath === null) {
			res.writeHead(403).end();
			return;
		}
		if (urlPath === '/') {
			filePath = join(root, 'demo/index.html');
		}
		let data = await readFile(filePath);
		if (extname(filePath) === '.html') {
			data = data.toString().replaceAll('{{IFRAMELY_API_KEY}}', apiKey);
		}
		res.writeHead(200, {
			'content-type': mime[extname(filePath)] || 'application/octet-stream'
		});
		res.end(data);
	} catch {
		res.writeHead(404).end('not found');
	}
}).listen(port, '127.0.0.1', () =>
	console.warn(
		`serving ${root} on http://localhost:${port} (api_key: ${apiKey === 'TEST' ? 'TEST placeholder' : 'from environment'})`
	)
);
