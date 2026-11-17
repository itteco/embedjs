import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Same define as scripts/build.js, so the tests see the real LIB_VERSION.
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

export default defineConfig({
	define: {
		__LIB_VERSION__: JSON.stringify(version)
	},
	test: {
		environment: 'jsdom',
		include: ['tests/unit/**/*.test.ts']
	}
});
