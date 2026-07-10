import { test, expect } from '@playwright/test';

// The public window.iframely surface as shipped by the last webpack build
// (v1.11). The migration must not add or remove keys.
const EXPECTED_KEYS = [
    'ASPECT_WRAPPER_CLASS', 'BASE_RE', 'CDN', 'CDN_RE', 'CLEAR_WRAPPER_STYLES_TIMEOUT',
    'DOMAINS', 'ID_RE', 'LAZY_IFRAME_FADE_TIMEOUT', 'LAZY_IFRAME_SHOW_TIMEOUT',
    'LOADER_CLASS', 'MAXWIDTH_WRAPPER_CLASS', 'RECOVER_HREFS_ON_CANCEL', 'SCRIPT_RE',
    'SHADOW', 'SUPPORTED_QUERY_STRING', 'SUPPORTED_THEMES', 'SUPPORT_IFRAME_LOADING_ATTR',
    'VERSION', '_loaded', 'addEventListener', 'buildImportWidgets', 'cancelWidget',
    'config', 'events', 'extendOptions', 'findIframe', 'getElementComputedStyle',
    'isTouch', 'load', 'on', 'openHref', 'setTheme', 'trigger', 'triggerAsync', 'widgets'
];

test('embed.js exposes the exact pre-migration API surface', async ({ page }) => {
    await page.goto('/demo/new.html');
    await page.waitForFunction(() => (window as any).iframely && (window as any).iframely._loaded);

    const keys = await page.evaluate(() => Object.keys((window as any).iframely).sort());
    expect(keys).toEqual(EXPECTED_KEYS);

    const constants = await page.evaluate(() => {
        const iframely = (window as any).iframely;
        return {
            version: iframely.VERSION,
            supportsLoadingAttr: iframely.SUPPORT_IFRAME_LOADING_ATTR,
            domains: iframely.DOMAINS
        };
    });
    // VERSION is sent to the API as the v= param; it must stay 1.
    expect(constants.version).toBe(1);
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
