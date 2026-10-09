import { expect, test } from '@playwright/test';
import { siteConfig } from '../../site.config';

test('the shell, commands, metadata and About use one profile', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="author"]')).toHaveAttribute('content', siteConfig.site.author);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${siteConfig.site.origin}/`);
  await expect(page.locator('html')).toHaveAttribute('lang', siteConfig.site.language);
  const input = page.getByRole('textbox', { name: 'Terminal command input' }).filter({ visible: true });
  await input.fill('whoami');
  await input.press('Enter');
  await expect(page.locator('.whitespace-pre-wrap:visible').filter({ hasText: siteConfig.terminal.username }).last()).toBeVisible();
  await input.fill('pwd');
  await input.press('Enter');
  await expect(page.locator('.whitespace-pre-wrap:visible').filter({ hasText: `/home/${siteConfig.terminal.username}` }).last()).toBeVisible();
  await page.locator('a[href="/about"]:visible').first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByText(siteConfig.about.paragraphs[0], { exact: true })).toBeVisible();
});
test('the default template makes no comment request or inherited owner reference', async ({ page, request }) => {
  test.skip(Boolean(siteConfig.giscus), 'Owner profile intentionally preserves comments.');
  const commentRequests: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).hostname === 'giscus.app') commentRequests.push(request.url()); });
  await page.goto('/posts/image-lightbox-demo');
  await expect(page.locator('article')).toBeVisible();
  await page.locator('.article-image-trigger').first().click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  expect(commentRequests).toEqual([]);
  const html = await (await request.get('/posts/image-lightbox-demo')).text();
  expect(html).not.toMatch(/chlorinec\.top|KiritoKing\/notion-astro-rev|chlorinec@blog/);
  const rss = await (await request.get('/rss.xml')).text();
  expect(rss).toContain(siteConfig.site.origin);
  expect(rss).not.toContain('chlorinec.top');
});
