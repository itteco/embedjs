// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { resolve, sep } from 'node:path';
import { isLoopbackHost, resolveUnderRoot } from '../../scripts/serve-path.mjs';

// An absolute path in the current platform's notation.
const root = resolve('srv', 'app');

describe('resolveUnderRoot', () => {
	it('serves the root itself and paths below it', () => {
		expect(resolveUnderRoot(root, '/')).toBe(root + sep);
		expect(resolveUnderRoot(root, '/demo/index.html')).toBe(
			[root, 'demo', 'index.html'].join(sep)
		);
		// A trailing separator on the root makes no difference.
		expect(resolveUnderRoot(root + sep, '/demo/index.html')).toBe(
			[root, 'demo', 'index.html'].join(sep)
		);
	});

	it('rejects traversal that survives URL parsing (decoded %2f)', () => {
		expect(resolveUnderRoot(root, '/../app-private/.env')).toBeNull();
		expect(resolveUnderRoot(root, '/../other/x')).toBeNull();
		expect(resolveUnderRoot(root, '/..')).toBeNull();
	});

	it('rejects a sibling directory that shares the root name as a prefix', () => {
		// The old startsWith(root) check admitted this one.
		expect(resolveUnderRoot(root, '/../app-private/.env')).toBeNull();
	});

	it('rejects dotfiles and dot-directories under the root', () => {
		expect(resolveUnderRoot(root, '/.env')).toBeNull();
		expect(resolveUnderRoot(root, '/.git/config')).toBeNull();
		expect(resolveUnderRoot(root, '/demo/.hidden/index.html')).toBeNull();
		// A dot inside a name is fine.
		expect(resolveUnderRoot(root, '/dist/embed.min.js')).toBe(
			[root, 'dist', 'embed.min.js'].join(sep)
		);
	});

	// Windows opens .env and .git under other names as well; none of them
	// starts with a dot.
	it('rejects the alternative Windows spellings of a dotfile', () => {
		expect(resolveUnderRoot(root, '/ENV~1')).toBeNull();
		expect(resolveUnderRoot(root, '/GIT~1/config')).toBeNull();
		expect(resolveUnderRoot(root, '/demo/SECRET~2.HTM')).toBeNull();
		expect(resolveUnderRoot(root, '/package.json.')).toBeNull();
		expect(resolveUnderRoot(root, '/package.json ')).toBeNull();
		expect(resolveUnderRoot(root, '/package.json::$DATA')).toBeNull();
		// A tilde that is not a short-name suffix is fine.
		expect(resolveUnderRoot(root, '/demo/a~b.html')).toBe([root, 'demo', 'a~b.html'].join(sep));
	});

	it('rejects backslash traversal on Windows (decoded %5c)', () => {
		if (process.platform !== 'win32') {
			// A backslash is an ordinary filename character elsewhere.
			return;
		}
		expect(resolveUnderRoot(root, '/\\..\\app-private/.env')).toBeNull();
	});
});

// DNS rebinding: a foreign hostname resolved to 127.0.0.1 reaches the
// loopback server, and gives itself away in the Host header.
describe('isLoopbackHost', () => {
	it('accepts the loopback names, with or without a port', () => {
		for (const host of ['localhost:8917', 'LOCALHOST', '127.0.0.1:8917', '[::1]:8917']) {
			expect(isLoopbackHost(host)).toBe(true);
		}
	});

	it('rejects any other or missing host', () => {
		for (const host of [
			'evil.example:8917',
			'localhost.evil.example',
			'127.0.0.1.evil.example:8917',
			'',
			undefined
		]) {
			expect(isLoopbackHost(host)).toBe(false);
		}
	});
});
