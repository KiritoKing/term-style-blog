import { expect, test } from '@playwright/test';

for (const viewport of [
  { name: 'desktop', size: { width: 1440, height: 900 }, openMenu: false },
  { name: 'mobile', size: { width: 390, height: 844 }, openMenu: true },
] as const) {
  test(`sidebar search binds without script errors on ${viewport.name}`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setViewportSize(viewport.size);
    await page.goto('/');
    if (viewport.openMenu) {
      await page.locator('details[data-mobile-navigation] > summary').click();
    }

    const input = page.locator('[data-sidebar-grep-input]:visible');
    await expect(input).toHaveCount(1);
    await input.fill('rust');
    await Promise.all([
      page.waitForURL(/\/search\?q=rust$/),
      input.press('Enter'),
    ]);

    expect(pageErrors).toEqual([]);
  });
}
