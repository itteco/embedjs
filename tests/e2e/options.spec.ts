import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/demo/options.html');
    await page.waitForFunction(() => !!document.querySelector('#form input'));
});

test('renders all option element types, grouped', async ({ page }) => {
    const form = page.locator('#form');
    await expect(form.locator('input[type="checkbox"]')).toHaveCount(2);
    await expect(form.locator('input[type="radio"]')).toHaveCount(3);
    await expect(form.locator('select')).toHaveCount(1);
    await expect(form.locator('input[type="range"]')).toHaveCount(1);
    // Checkboxes are wrapped in a group container.
    await expect(form.locator('.iframely-option__group .iframely-option-checkbox')).toHaveCount(2);
});

test('applies German labels from the separately loaded i18n bundle', async ({ page }) => {
    const labels = await page.locator('#form label').allTextContents();
    const text = labels.join('|');
    expect(text).toContain('Theme Farbe');
    expect(text).toContain('Artwork ausblenden');
    expect(text).toContain('Wiedergabeliste anzeigen');
    expect(text).toContain('Höhe einstellen');
    // Select options are translated too.
    const optionTexts = await page.locator('#form select option').allTextContents();
    expect(optionTexts).toContain('Klassisch');
    expect(optionTexts).toContain('Bild');
});

test('fires options-changed with the non-default query on user input', async ({ page }) => {
    await page.locator('#form input[name="_hide"]').check();

    const changes = await page.evaluate(() => (window as any).__optionsChanged);
    expect(changes).toHaveLength(1);
    expect(changes[0].id).toBe('test-form');
    expect(changes[0].query._hide).toBe(true);

    await page.locator('#form select[name="style"]').selectOption('mini');
    const changes2 = await page.evaluate(() => (window as any).__optionsChanged);
    expect(changes2).toHaveLength(2);
    expect(changes2[1].query.style).toBe('mini');
});
