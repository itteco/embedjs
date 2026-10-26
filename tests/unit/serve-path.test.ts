// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { resolve, sep } from 'node:path';
import { resolveUnderRoot } from '../../scripts/serve-path.mjs';

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

	it('rejects backslash traversal on Windows (decoded %5c)', () => {
		if (process.platform !== 'win32') {
			// A backslash is an ordinary filename character elsewhere.
			return;
		}
		expect(resolveUnderRoot(root, '/\\..\\app-private/.env')).toBeNull();
	});
});
