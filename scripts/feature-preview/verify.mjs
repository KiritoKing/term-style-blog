import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { validateIdentity, validateOrigin, verifyHtml } from './identity.mjs';

const local = validateIdentity(JSON.parse(await readFile('dist/_feature-preview.json', 'utf8')));
assert.equal(local.framework_sha, process.env.FRAMEWORK_SHA);
const origin = validateOrigin(process.env.PREVIEW_URL, 'notion-astro-rev');
const headers = {};
if (process.env.CF_ACCESS_CLIENT_ID || process.env.CF_ACCESS_CLIENT_SECRET) {
  assert.ok(process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET, 'Access credentials must be a complete pair');
  headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID;
  headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET;
}
// Never follow a redirect with Access credentials, or mistake Access login for blog HTML.
async function get(path) {
  const response = await fetch(new URL(path, origin), { headers, redirect: 'manual', signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `Hosted path did not return blog output: ${path}`);
  return response.text();
}
validateIdentity(JSON.parse(await get('/_feature-preview.json')));
assert.equal(JSON.parse(await get('/_feature-preview.json')).framework_sha, local.framework_sha);
verifyHtml(await get('/posts/image-lightbox-demo'), local.framework_sha);
assert.match(await get('/robots.txt'), /Disallow:\s*\//);

await mkdir('preview-evidence', { recursive: true });
const browser = await chromium.launch({ headless: true });
const measurements = [];
try {
  for (const width of [1440, 390]) {
    for (const dark of [false, true]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: dark ? 'dark' : 'light' });
      await context.addInitScript((theme) => localStorage.setItem('tsb:theme', theme), dark ? 'dark' : 'light');
      // Add credentials only to this exact verified Pages origin. Abort external
      // comments/fonts and all redirects so no credential can cross origins.
      await context.route('**/*', async (route) => {
        const request = route.request();
        if (new URL(request.url()).origin !== origin || request.redirectedFrom()) return route.abort();
        await route.continue({ headers: { ...request.headers(), ...headers } });
      });
      const page = await context.newPage();
      await page.goto(`${origin}/posts/image-lightbox-demo`);
      assert.equal(await page.locator('html').getAttribute('data-feature-preview-sha'), local.framework_sha);
      await page.waitForFunction((dark) => document.documentElement.classList.contains('dark') === dark, dark);
      const opener = page.locator('.article-image-trigger').first();
      await opener.click();
      const dialog = page.getByRole('dialog', { name: '图片查看器' });
      await dialog.waitFor({ state: 'visible' });
      const zoomIn = dialog.getByRole('button', { name: '放大图片' });
      await zoomIn.waitFor();
      await page.waitForFunction(() => !document.querySelector('[data-panzoom-controls]').disabled);
      const scale = () => page.locator('[data-panzoom-content]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a);
      await zoomIn.click();
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-panzoom-content]')).transform).a > 1);
      const zoomed = await scale();
      await dialog.getByRole('button', { name: '重置适配视图' }).click();
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-panzoom-content]')).transform).a === 1);
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      await page.screenshot({ path: `preview-evidence/viewer-${width}-${dark ? 'dark' : 'light'}.png` });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate((element) => element === document.activeElement), true);
      measurements.push({ width, theme: dark ? 'dark' : 'light', zoomed, reset: 1, focus_returned: true });
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const record = { framework_sha: local.framework_sha, preview_url: origin, fixture_url: `${origin}/posts/image-lightbox-demo`, mode: 'preview', content_source: 'repository-demo', browser: 'Chromium', hosted_acceptance: 'passed', measurements };
await writeFile('preview-evidence/deployment-record.json', JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
