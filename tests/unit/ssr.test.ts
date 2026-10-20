// @vitest-environment node
//
// Simulates an isomorphic (e.g. SvelteKit) server pass: no window, no
// document. Importing any public entry must neither throw nor run browser
// side effects, and the exported singleton must be an inert no-op stub.
import { describe, expect, it } from 'vitest';

describe('SSR import (node environment)', () => {
	it('runs without browser globals', () => {
		expect(typeof window).toBe('undefined');
		expect(typeof document).toBe('undefined');
	});

	it('imports the main entry without errors or side effects', async () => {
		const { iframely } = await import('../../src/main');
		expect(iframely).toBeDefined();
		// Nothing booted: the browser-only bootstrap was skipped.
		expect(iframely._loaded).toBeUndefined();
	});

	it('tolerates API calls on the server as no-ops', async () => {
		const { iframely } = await import('../../src/main');
		expect(() => {
			iframely.on('load', () => {});
			iframely.trigger('anything');
			iframely.load();
			iframely.unload();
			iframely.configure({ api_key: 'x' });
			iframely.setTheme('dark');
			iframely.cancelWidget();
		}).not.toThrow();
		// The stub must stay stateless: one server module instance is shared
		// across requests.
		expect(iframely.config).toEqual({});
	});

	it('imports the options and i18n entries without errors', async () => {
		await expect(import('../../src/main-options')).resolves.toBeDefined();
		await expect(import('../../src/options/lang/labels.de')).resolves.toBeDefined();
		await expect(import('../../src/options/lang/labels.fr')).resolves.toBeDefined();
	});

	it('exposes the public constants and legacy namespaces on the stub', async () => {
		const { iframely } = await import('../../src/main');
		expect(iframely.VERSION).toBe(1);
		expect(iframely.DOMAINS).toContain('cdn.iframe.ly');
		expect(iframely.CDN).toBe('cdn.iframe.ly');
		expect(iframely.SUPPORTED_THEMES).toEqual(['auto', 'light', 'dark']);
		expect(iframely.SCRIPT_RE).toBeInstanceOf(RegExp);
		// No DOM on the server, so no native lazy loading.
		expect(iframely.SUPPORT_IFRAME_LOADING_ATTR).toBe(false);
		expect(typeof iframely.widgets.load).toBe('function');
		expect(typeof iframely.events.on).toBe('function');
	});
});
