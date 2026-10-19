import { join, normalize, sep } from 'node:path';

// Resolves a decoded request path under the served root, or returns null
// when the result would escape it. URL parsing already collapses a plain
// "/../", but an encoded slash (or backslash on Windows) survives into the
// decoded path, and a bare startsWith(root) would also admit sibling
// directories such as <root>-private.
export function resolveUnderRoot(root, urlPath) {
	if (root.endsWith(sep)) {
		root = root.slice(0, -1);
	}
	const filePath = normalize(join(root, urlPath));
	if (filePath !== root && !filePath.startsWith(root + sep)) {
		return null;
	}
	return filePath;
}
