import { test, expect } from '@playwright/test';

test('loading embed.js and embed-options.js together boots the core once and the options once', async ({
	page
}) => {
	// Same-major bundles share the core by design: no foreign-core warning.
	const warnings: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'warning' && msg.text().includes('[iframely]')) {
			warnings.push(msg.text());
		}
	});
	await page.goto('/demo/double.html');
	await page.waitForFunction(() => (window as any).iframely && (window as any).iframely._loaded);

	const state = await page.evaluate(() => ({
		initCount: (window as any).__initCount(),
		hasOn: typeof (window as any).iframely.on === 'function',
		hasBuildOptionsForm: typeof (window as any).iframely.buildOptionsForm === 'function'
	}));

	expect(state.initCount).toBe(1);
	expect(state.hasOn).toBe(true);
	// The second bundle must still contribute the options subsystem.
	expect(state.hasBuildOptionsForm).toBe(true);
	expect(warnings).toEqual([]);
});
