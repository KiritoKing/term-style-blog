import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('about page loads successfully', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
  });

  test('content sections are visible', async ({ page }) => {
    await page.goto('/about');
    // Check for about heading or content
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
  });
});