import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('home page loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('page has visible terminal UI elements', async ({ page }) => {
    await page.goto('/');
    // Check for system online heading
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('navigation to posts section works', async ({ page }) => {
    await page.goto('/');
    // Click on posts link in sidebar or find posts navigation
    const postsLink = page.locator('a[href="/posts"]').first();
    await postsLink.click();
    await expect(page).toHaveURL(/\/posts/);
  });
});