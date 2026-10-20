import { defineConfig } from 'oxfmt';

export default defineConfig({
	useTabs: true,
	tabWidth: 4,
	singleQuote: true,
	trailingComma: 'none',
	sortPackageJson: false,
	ignorePatterns: ['dist/**', 'demo/**', '**/*.md']
});
