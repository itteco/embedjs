import { rm } from 'node:fs/promises';
import { build } from 'vite';

// Each IIFE bundle must be a single self-contained file with a fixed name:
// the library locates its own <script> tag via SCRIPT_RE (matches
// "embed.js"/"iframely.js") and parses config from its query string.
// IIFE output does not support multiple entries, hence one build per entry.
const iifeEntries = [
	['src/index.ts', 'embed'],
	['src/index-options.ts', 'embed-options'],
	['src/options/entry.ts', 'options'],
	['src/options/lang/labels.de.ts', 'options.i18n.de'],
	['src/options/lang/labels.fr.ts', 'options.i18n.fr']
];

for (const [entry, name] of iifeEntries) {
	await build({
		configFile: false,
		logLevel: 'info',
		build: {
			outDir: 'dist',
			emptyOutDir: false,
			minify: false,
			modulePreload: false,
			copyPublicDir: false,
			rolldownOptions: {
				input: entry,
				output: [
					{ format: 'iife', entryFileNames: `${name}.js`, minify: false },
					{ format: 'iife', entryFileNames: `${name}.min.js`, minify: true }
				]
			}
		}
	});
}

// ESM build for npm/bundler consumers. dist is committed, so chunk names
// must be stable (no hashes) to avoid diff noise.
await rm('dist/esm', { recursive: true, force: true });
await build({
	configFile: false,
	logLevel: 'info',
	build: {
		outDir: 'dist/esm',
		emptyOutDir: false,
		minify: false,
		// Maps into the shipped src/, for consumers' debuggers and stack traces.
		sourcemap: true,
		modulePreload: false,
		copyPublicDir: false,
		rolldownOptions: {
			// Keep the entries' `export` statements (Vite's app build drops them).
			preserveEntrySignatures: 'strict',
			input: {
				main: 'src/main.ts',
				'main-options': 'src/main-options.ts',
				'i18n.de': 'src/options/lang/labels.de.ts',
				'i18n.fr': 'src/options/lang/labels.fr.ts'
			},
			output: {
				format: 'es',
				entryFileNames: '[name].js',
				// Rolldown names a shared chunk after one of its modules; for the
				// chunk holding the whole core that was the tiny server-stub.ts.
				chunkFileNames: (chunk) =>
					chunk.moduleIds.some((id) => /[\\/]src[\\/]boot-core\.ts$/.test(id))
						? 'chunks/core.js'
						: 'chunks/[name].js'
			}
		}
	}
});
