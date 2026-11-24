import { defineConfig } from 'oxlint';

export default defineConfig({
	env: {
		browser: true
	},
	categories: {
		correctness: 'error'
	},
	rules: {
		'no-console': ['warn', { allow: ['warn', 'error'] }],
		'no-empty': ['error', { allowEmptyCatch: true }],
		'typescript/no-explicit-any': 'off'
	},
	ignorePatterns: ['dist', 'demo', 'test-results', 'playwright-report'],
	overrides: [
		{
			files: ['scripts/**'],
			env: { node: true, browser: false }
		}
	]
});
