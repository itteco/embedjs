import { test, expect } from '@playwright/test';

test('loading embed.js and embed-options.js together boots exactly once', async ({ page }) => {
	await page.goto('/demo/double.html');
	await page.waitForFunction(() => (window as any).iframely && (window as any).iframely._loaded);

	const state = await page.evaluate(() => ({
		initCount: (window as any).__initCount(),
		hasOn: typeof (window as any).iframely.on === 'function'
	}));

	expect(state.initCount).toBe(1);
	expect(state.hasOn).toBe(true);
});
