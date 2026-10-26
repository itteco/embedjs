import { defineConfig, devices } from '@playwright/test';

// Fixture pages in demo/ reference http://localhost:8917 with absolute URLs
// because the library's SCRIPT_RE self-configuration only matches absolute
// script src values. Keep the port in sync with scripts/serve.mjs.
const BASE_URL = 'http://localhost:8917';

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	reporter: [['list']],
	use: {
		baseURL: BASE_URL
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		}
	],
	webServer: {
		command: 'node scripts/serve.mjs',
		url: BASE_URL + '/demo/index.html',
		// Tests assert against the TEST placeholder key, so never reuse a
		// dev server that may be running with a real key from .env.
		reuseExistingServer: false,
		env: { IFRAMELY_API_KEY: 'TEST' }
	}
});
