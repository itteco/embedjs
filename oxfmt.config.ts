import { defineConfig } from 'oxfmt';

export default defineConfig({
	useTabs: true,
	tabWidth: 4,
	singleQuote: true,
	trailingComma: 'none',
	sortPackageJson: false,
	// pnpm rewrites pnpm-workspace.yaml with 2-space indents.
	ignorePatterns: ['dist/**', 'demo/**', '**/*.md', 'pnpm-workspace.yaml']
});
