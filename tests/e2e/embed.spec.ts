import { test, expect, type Page } from '@playwright/test';

// Serve a stub widget instead of the real Iframely CDN so tests are
// deterministic. The stub can post messages back to the parent page,
// exercising the full messaging -> findIframe -> handler chain.
async function stubWidget(page: Page, bodyScript = ''): Promise<void> {
	await page.route('**/api/iframe*', (route) =>
		route.fulfill({
			contentType: 'text/html',
			body: `<!doctype html><html><body><script>${bodyScript}</script></body></html>`
		})
	);
}

test('parses config from its own script src query string', async ({ page }) => {
	await stubWidget(page);
	await page.goto('/demo/index.html');

	await page.waitForFunction(() => (window as any).iframely && (window as any).iframely._loaded);

	const state = await page.evaluate(() => {
		const iframely = (window as any).iframely;
		return {
			api_key: iframely.config.api_key,
			theme: iframely.config.theme,
			intersection: iframely.config.intersection,
			cdn: iframely.CDN,
			stylesInjected: !!document.getElementById('iframely-styles')
		};
	});

	expect(state).toEqual({
		api_key: 'TEST',
		theme: 'dark',
		intersection: true,
		cdn: 'cdn.iframe.ly',
		stylesInjected: true
	});
});

test('unfurls an anchor into an iframe pointing at the API endpoint', async ({ page }) => {
	await stubWidget(page);
	await page.goto('/demo/index.html');

	const iframe = page.locator('.iframely-responsive iframe');
	await expect(iframe).toHaveCount(1);
	await expect(page.locator('a[data-iframely-url]')).toHaveCount(0);

	const src = await iframe.getAttribute('src');
	expect(src).toContain('cdn.iframe.ly/api/iframe');
	expect(src).toContain(
		'url=' + encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
	);
	expect(src).toContain('v=1');
	expect(src).toContain('app=1');
	expect(src).toContain('theme=dark');
	expect(src).toContain('api_key=TEST');
});

test('handles a resize message from the widget iframe', async ({ page }) => {
	await stubWidget(
		page,
		"parent.postMessage(JSON.stringify({ method: 'resize', height: 400 }), '*');"
	);
	await page.goto('/demo/index.html');

	const aspectWrapper = page.locator('.iframely-responsive');
	await expect(aspectWrapper).toHaveCSS('height', '400px');
	await expect(aspectWrapper).toHaveCSS('padding-bottom', '0px');
});

test('handles a cancelWidget message by removing the widget', async ({ page }) => {
	await stubWidget(page, "parent.postMessage(JSON.stringify({ method: 'cancelWidget' }), '*');");
	await page.goto('/demo/index.html');

	await expect(page.locator('.iframely-embed')).toHaveCount(0);
	await expect(page.locator('iframe')).toHaveCount(0);
});

test('recreates a link on cancel when the anchor had text', async ({ page }) => {
	await stubWidget(page, "parent.postMessage(JSON.stringify({ method: 'cancelWidget' }), '*');");
	await page.goto('/demo/cancel-recover.html');

	const link = page.locator('a[href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"]');
	await expect(link).toHaveText('Watch the video');
	await expect(link).toHaveAttribute('target', '_blank');
	await expect(link).toHaveAttribute('rel', 'noopener');
	await expect(page.locator('.iframely-embed')).toHaveCount(0);
});
