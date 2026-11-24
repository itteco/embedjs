import { test, expect } from '@playwright/test';

test('options.js without embed.js fails silently on buildOptionsForm', async ({ page }) => {
	const pageErrors: string[] = [];
	const warnings: string[] = [];
	page.on('pageerror', (error) => pageErrors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'warning') {
			warnings.push(message.text());
		}
	});

	await page.goto('/demo/options-standalone.html');
	await page.waitForFunction(() => (window as any).__done);

	// The inline script ran to completion: nothing threw.
	expect(pageErrors).toEqual([]);
	expect(await page.evaluate(() => (window as any).__errors)).toEqual([]);
	// The form was not rendered, and a warning points at the missing embed.js.
	await expect(page.locator('#form *')).toHaveCount(0);
	expect(warnings.join('|')).toContain('requires embed.js');
});
