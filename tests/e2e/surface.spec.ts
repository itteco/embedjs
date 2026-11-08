import { test, expect } from '@playwright/test';
import pkg from '../../package.json' with { type: 'json' };

// The public window.iframely surface as shipped by the last webpack build
// (v1.11), plus `configure` (new in 2.0; `extendOptions` remains as its
// deprecated alias), `API_VERSION` (the 2.0 name of `VERSION`, which stays as
// its deprecated alias) and `LIB_VERSION`. Nothing else may be added or removed.
const EXPECTED_KEYS = [
	'API_VERSION',
	'ASPECT_WRAPPER_CLASS',
	'BASE_RE',
	'CDN',
	'CDN_RE',
	'CLEAR_WRAPPER_STYLES_TIMEOUT',
	'DOMAINS',
	'ID_RE',
	'LAZY_IFRAME_FADE_TIMEOUT',
	'LAZY_IFRAME_SHOW_TIMEOUT',
	'LIB_VERSION',
	'LOADER_CLASS',
	'MAXWIDTH_WRAPPER_CLASS',
	'RECOVER_HREFS_ON_CANCEL',
	'SCRIPT_RE',
	'SHADOW',
	'SUPPORTED_QUERY_STRING',
	'SUPPORTED_THEMES',
	'SUPPORT_IFRAME_LOADING_ATTR',
	'VERSION',
	'_loaded',
	'addEventListener',
	'buildImportWidgets',
	'cancelWidget',
	'config',
	'configure',
	'events',
	'extendOptions',
	'findIframe',
	'getElementComputedStyle',
	'isTouch',
	'load',
	'on',
	'openHref',
	'setTheme',
	'trigger',
	'triggerAsync',
	// unload is new in 2.0.
	'unload',
	'widgets'
];

test('embed.js exposes the exact pre-migration API surface', async ({ page }) => {
	await page.goto('/demo/new.html');
	await page.waitForFunction(() => (window as any).iframely && (window as any).iframely._loaded);

	const keys = await page.evaluate(() => Object.keys((window as any).iframely).sort());
	expect(keys).toEqual(EXPECTED_KEYS);

	const constants = await page.evaluate(() => {
		const iframely = (window as any).iframely;
		return {
			apiVersion: iframely.API_VERSION,
			version: iframely.VERSION,
			libVersion: iframely.LIB_VERSION,
			supportsLoadingAttr: iframely.SUPPORT_IFRAME_LOADING_ATTR,
			domains: iframely.DOMAINS
		};
	});
	// API_VERSION is sent to the API as the v= param; it must stay 1, and the
	// deprecated VERSION alias with it.
	expect(constants.apiVersion).toBe(1);
	expect(constants.version).toBe(1);
	// LIB_VERSION is the release that built the bundle.
	expect(constants.libVersion).toBe(pkg.version);
	expect(constants.supportsLoadingAttr).toBe(true);
	expect(constants.domains).toEqual(['cdn.iframe.ly', 'iframe.ly', 'if-cdn.com', 'iframely.net']);
});

test('embed-options.js additionally exposes buildOptionsForm', async ({ page }) => {
	await page.goto('/demo/options.html');
	await page.waitForFunction(() => (window as any).iframely && (window as any).iframely._loaded);

	const extras = await page.evaluate(() => {
		const iframely = (window as any).iframely;
		return {
			buildOptionsForm: typeof iframely.buildOptionsForm,
			optionsTranslator: typeof iframely.optionsTranslator
		};
	});
	expect(extras).toEqual({ buildOptionsForm: 'function', optionsTranslator: 'function' });
});
