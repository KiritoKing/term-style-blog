// Reproducible original catalogue assets from the public synthetic template.
// Run after pnpm build and with pnpm preview:e2e serving on the default port.
import assert from 'node:assert/strict';
import { mkdir, stat } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = 'http://127.0.0.1:4321';
const directory = 'docs/images';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
const shots = [
  { name: 'terminal-blog.png', path: '/', width: 1440, height: 900, theme: 'dark' },
  { name: 'article-light.png', path: '/posts/hello-world', width: 1440, height: 1000, theme: 'light' },
  { name: 'mobile-dark.png', path: '/posts/image-lightbox-demo', width: 390, height: 844, theme: 'dark' },
  { name: 'viewer-light.png', path: '/posts/image-lightbox-demo', width: 1440, height: 900, theme: 'light' },
];
try {
  for (const shot of shots) {
    const context = await browser.newContext({ viewport: { width: shot.width, height: shot.height }, colorScheme: shot.theme, reducedMotion: 'reduce', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36' });
    // Pin the synthetic display OS; never capture the operator's machine details.
    await context.addInitScript(({ theme }) => {
      localStorage.setItem('tsb:theme', theme);
    }, shot);
    await context.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(origin + shot.path);
    assert.equal(await page.locator('meta[name="author"]').getAttribute('content'), 'Demo Author', 'Screenshots require neutral template build');
    await page.waitForFunction((dark) => document.documentElement.classList.contains('dark') === dark, shot.theme === 'dark');
    await page.evaluate(() => document.fonts.ready);
    if (shot.name === 'article-light.png') await page.locator('[data-blog-mermaid-complete="true"]').waitFor();
    if (shot.name === 'mobile-dark.png') await page.locator('article h1').scrollIntoViewIfNeeded();
    if (shot.name === 'viewer-light.png') {
      await page.locator('.article-image-trigger').first().click();
      await page.getByRole('dialog').waitFor();
      await page.waitForFunction(() => !document.querySelector('[data-panzoom-controls]').disabled);
    }
    await page.screenshot({ path: `${directory}/${shot.name}` });
    await context.close();
  }
} finally {
  await browser.close();
}
const sizes = await Promise.all(shots.map(async ({ name }) => ({ name, bytes: (await stat(`${directory}/${name}`)).size })));
assert.ok(sizes.reduce((total, shot) => total + shot.bytes, 0) <= 8_000_000, 'Four screenshots must total at most 8 MB');
console.log(JSON.stringify(sizes));
