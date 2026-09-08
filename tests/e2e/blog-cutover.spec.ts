import { expect, test } from '@playwright/test';

const postSlug = process.env.E2E_POST_SLUG ?? 'hello-world';

test('preserves the terminal shell and exact slug route', async ({ page }) => {
  await page.goto(`/posts/${postSlug}`);
  await expect(page.locator('article h1')).toBeVisible();
  await expect(page.locator('[data-terminal-shell]')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://chlorinec.top/posts/${postSlug}`,
  );
});

test('keeps terminal help interaction', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[aria-label="Terminal command input"]:visible');
  await input.fill('help');
  await input.press('Enter');
  await expect(
    page.locator('.whitespace-pre-wrap:visible').filter({ hasText: 'Available commands:' }),
  ).toBeVisible();
});

test('terminal cat preserves the exact post slug case', async ({ page }) => {
  await page.goto('/posts');
  const input = page.locator('input[aria-label="Terminal command input"]:visible');
  await input.fill(`cat ${postSlug}.md`);
  await input.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/posts/${postSlug}$`));
});

test('serves historical redirects as 301', async ({ request }) => {
  const response = await request.get('/post/technology/keepass', { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe('/posts/KeePass');
});

test('search finds Chinese article content', async ({ page }) => {
  const query = process.env.E2E_SEARCH_QUERY ?? '像素';
  await page.goto(`/search?q=${encodeURIComponent(query)}`);
  await expect(page.locator('#grep-results')).not.toContainText('search index not found');
  await expect(page.locator('.grep-card').first()).toBeVisible();
});

test('giscus preserves historical pathname mapping', async ({ page }) => {
  await page.route('https://giscus.app/client.js', (route) => route.abort());
  await page.goto(`/posts/${postSlug}`);
  const script = page.locator('.giscus-terminal script[data-mapping="pathname"]');
  await expect(script).toHaveAttribute('data-repo', 'KiritoKing/notion-astro-rev');
  await expect(script).toHaveAttribute('data-category', 'Announcements');
});

test('article has no page-level horizontal overflow at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/posts/${postSlug}`);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.locator('article[data-pagefind-body]')).toBeVisible();
});
