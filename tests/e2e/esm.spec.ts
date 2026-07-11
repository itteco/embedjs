import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.route('**/api/iframe*', (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: '<!doctype html><html><body>widget</body></html>'
		})
	);
	await page.goto('/demo/esm.html');
	await page.waitForFunction(() => !!(window as any).__esm);
});

test('the ESM build exports the same singleton that is attached to window', async ({ page }) => {
	const state = await page.evaluate(() => (window as any).__esm);
	expect(state).toEqual({
		sameSingleton: true,
		version: 1,
		hasOn: true,
		autorun: false
	});
});

test('does not auto-run on import; iframely.load() activates it', async ({ page }) => {
	// Give the dom-ready autorun path time to fire if it (wrongly) were active.
	await page.waitForTimeout(250);
	await expect(page.locator('a[data-iframely-url]')).toHaveCount(1);
	await expect(page.locator('iframe')).toHaveCount(0);

	await page.evaluate(() => (window as any).__load());

	const iframe = page.locator('.iframely-responsive iframe');
	await expect(iframe).toHaveCount(1);
	await expect(page.locator('a[data-iframely-url]')).toHaveCount(0);
	expect(await iframe.getAttribute('src')).toContain('cdn.iframe.ly/api/iframe');
});

test('iframely.unload() removes the widgets load() built', async ({ page }) => {
	await page.evaluate(() => (window as any).__load());
	await expect(page.locator('.iframely-responsive iframe')).toHaveCount(1);

	await page.evaluate(() => (window as any).iframely.unload());

	await expect(page.locator('iframe')).toHaveCount(0);
	await expect(page.locator('.iframely-embed')).toHaveCount(0);
});
