import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test.skip(process.env.E2E_REAL_CORPUS !== '1', 'Runs against the immutable publication artifact only.');

async function imageArticles(directory = path.resolve('dist/posts'), relative = ''): Promise<string[]> {
  const routes: string[] = [];
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) routes.push(...await imageArticles(directory, child));
    else if (entry.isFile() && entry.name === 'index.html') {
      const html = await readFile(path.join(directory, child), 'utf8');
      const body = html.split('<div class="prose-terminal min-w-0">')[1]?.split('</article>')[0];
      if (body && /<img\b/.test(body)) {
        routes.push(`/posts/${relative.split(path.sep).map(encodeURIComponent).join('/')}/`);
      }
    }
  }
  return routes.sort();
}

test('immutable publication body image opens, zooms and closes with restored focus across navigation', async ({ page }) => {
  await page.route('https://giscus.app/**', route => route.abort());
  // Discover a public body image from the built artifact, without assuming demo routes or article titles.
  const candidates = await imageArticles();
  let article: string | undefined;
  for (const route of candidates) {
    await page.goto(route);
    if (await page.locator('.prose-terminal img:not(a img)').count()) { article = route; break; }
  }
  test.skip(!article, 'This valid publication snapshot has no unlinked body images; fixture CI covers image behavior.');
  const articleUrl = page.url();
  const opener = page.locator('.prose-terminal button[command="show-modal"]').first();
  const viewer = page.getByRole('dialog', { name: '图片查看器' });
  await expect(opener).toBeVisible();
  const source = opener.locator('img');
  const alt = await source.getAttribute('alt');
  await opener.click();
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('img')).toHaveAttribute('alt', alt ?? '');
  const zoom = viewer.getByRole('button', { name: '放大图片' });
  await expect(zoom).toBeEnabled();
  await zoom.click();
  await expect.poll(() => viewer.locator('[data-panzoom-content]').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1);
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  await expect(opener).toBeFocused();
  await page.locator('a[href="/posts"]').last().click();
  await expect(page).toHaveURL(/\/posts\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(articleUrl);
  await expect(opener).toBeVisible();
  for (let repeat = 0; repeat < 2; repeat++) {
    await opener.click();
    await expect(viewer).toBeVisible();
    await viewer.getByRole('button', { name: '关闭图片查看器' }).click();
    await expect(viewer).not.toBeVisible();
    await expect(opener).toBeFocused();
  }
});
