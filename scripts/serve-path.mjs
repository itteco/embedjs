import { join, normalize, relative, sep } from 'node:path';

// Resolves a decoded request path under the served root, or returns null
// when the result would escape it. URL parsing already collapses a plain
// "/../", but an encoded slash (or backslash on Windows) survives into the
// decoded path, and a bare startsWith(root) would also admit sibling
// directories such as <root>-private.
//
// Dotfiles and dot-directories are refused too: the root is the repo, and
// it holds .env (the real API key) and .git. So is every other spelling
// Windows accepts for them: an 8.3 short name (ENV~1, GIT~1), a trailing dot
// or space, and an alternate data stream (name:stream). Nothing the server
// is meant to serve has such a name.
export function resolveUnderRoot(root, urlPath) {
	if (root.endsWith(sep)) {
		root = root.slice(0, -1);
	}
	const filePath = normalize(join(root, urlPath));
	if (filePath !== root && !filePath.startsWith(root + sep)) {
		return null;
	}
	if (
		relative(root, filePath)
			.split(sep)
			.some((segment) => segment.startsWith('.') || /~\d|[. ]$|:/.test(segment))
	) {
		return null;
	}
	return filePath;
}

// Whether a request's Host header names this machine's loopback interface.
// The server binds to loopback, but a page on any site can still reach it by
// pointing its own hostname at 127.0.0.1 (DNS rebinding) and then read the
// demo pages, which carry the API key. Such a request keeps the foreign
// hostname in Host.
export function isLoopbackHost(host) {
	if (typeof host !== 'string') {
		return false;
	}
	const name = host.replace(/:\d+$/, '').toLowerCase();
	return name === 'localhost' || name === '127.0.0.1' || name === '[::1]';
}
