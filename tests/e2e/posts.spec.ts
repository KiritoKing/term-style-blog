import { test, expect } from '@playwright/test';

test.describe('Posts Listing', () => {
  test('posts listing page loads', async ({ page }) => {
    const response = await page.goto('/posts');
    expect(response?.status()).toBe(200);
  });

  test('post links are visible and clickable', async ({ page }) => {
    await page.goto('/posts');
    // Find at least one post link
    const postLink = page.locator('a[href^="/posts/"]').first();
    await expect(postLink).toBeVisible();
  });

  test('can navigate to a post detail page', async ({ page }) => {
    await page.goto('/posts');
    const postLink = page.locator('a[href^="/posts/"]').first();
    await postLink.click();
    // Should navigate to a specific post
    await expect(page).toHaveURL(/\/posts\/[^/]+/);
  });
});