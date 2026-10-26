import { join, normalize, relative, sep } from 'node:path';

// Resolves a decoded request path under the served root, or returns null
// when the result would escape it. URL parsing already collapses a plain
// "/../", but an encoded slash (or backslash on Windows) survives into the
// decoded path, and a bare startsWith(root) would also admit sibling
// directories such as <root>-private.
//
// Dotfiles and dot-directories are refused too: the root is the repo, and
// it holds .env (the real API key) and .git.
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
			.some((segment) => segment.startsWith('.'))
	) {
		return null;
	}
	return filePath;
}
