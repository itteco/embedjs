import { test, expect } from '@playwright/test';

test('the ESM build exports the same singleton that is attached to window', async ({ page }) => {
    await page.goto('/demo/esm.html');
    await page.waitForFunction(() => !!(window as any).__esm);

    const state = await page.evaluate(() => (window as any).__esm);
    expect(state).toEqual({
        sameSingleton: true,
        version: 1,
        hasOn: true
    });
});
