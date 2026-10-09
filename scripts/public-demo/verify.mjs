import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { chromium } from '@playwright/test';
import { validateIdentity, verifyHtml } from '../feature-preview/identity.mjs';
import { PUBLIC_ORIGIN, validatePublicOrigin, fetchAnonymous } from './control.mjs';

const local = validateIdentity(JSON.parse(await readFile('dist/_feature-preview.json', 'utf8')));
assert.equal(local.framework_sha, process.env.FRAMEWORK_SHA);
const origin = validatePublicOrigin(process.env.PREVIEW_URL);
const isThemePreview = true;
assert.ok(!process.env.CF_ACCESS_CLIENT_ID && !process.env.CF_ACCESS_CLIENT_SECRET, 'Anonymous demo verification cannot use Access credentials');
const headers = {};
const propagation = { deadline: Date.now() + 180000, onRetry: attempt => console.log(`Anonymous HTTPS propagation pending; bounded retry ${attempt}`) };
// Anonymous requests never follow redirects or accept an authentication page.
async function get(path) {
  const response = await fetchAnonymous(new URL(path, origin), propagation);
  assert.equal(response.status, 200, `Hosted path did not return blog output: ${path}`);
  return response.text();
}
const routes = [];
async function collectRoutes(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectRoutes(path);
    else if (entry.name.endsWith('.html') && entry.name !== '404.html') {
      const name = relative('dist', path).replaceAll('\\', '/');
      routes.push('/' + (name === 'index.html' ? '' : name.replace(/index\.html$/, '')));
    }
  }
}
await collectRoutes('dist');
for (const path of routes) {
  const html = await get(path);
  assert.ok(html.includes(`data-feature-preview-sha="${local.framework_sha}"`), `Stale HTML route ${path}`);
  assert.match(html, /<meta\b[^>]*name="robots"[^>]*content="noindex, nofollow"/);
  assert.doesNotMatch(html, /giscus-terminal|giscus\.app\/client|chlorinec\.top|chlorinec@blog/);
}
const stableIdentity = await fetchAnonymous(`${PUBLIC_ORIGIN}/_feature-preview.json`, propagation);
assert.equal(stableIdentity.status, 200, 'Stable alias must be anonymous');
assert.equal(validateIdentity(await stableIdentity.json()).framework_sha, local.framework_sha);
validateIdentity(JSON.parse(await get('/_feature-preview.json')));
assert.equal(JSON.parse(await get('/_feature-preview.json')).framework_sha, local.framework_sha);
verifyHtml(await get('/posts/image-lightbox-demo/'), local.framework_sha);
assert.match(await get('/robots.txt'), /Disallow:\s*\//);
if (isThemePreview) {
  const home = await get('/');
  assert.match(home, /<meta name="author" content="Demo Author"/);
  assert.doesNotMatch(home, /chlorinec\.top|chlorinec@blog/);
  assert.doesNotMatch(await get('/posts/hello-world/'), /giscus-terminal|giscus\.app\/client/);
}


await mkdir('preview-evidence', { recursive: true });
const browser = await chromium.launch({ headless: true });
const measurements = [];
try {
  for (const width of [1440, 390]) {
    for (const dark of [false, true]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: dark ? 'dark' : 'light', hasTouch: width === 390 });
      await context.addInitScript((theme) => localStorage.setItem('tsb:theme', theme), dark ? 'dark' : 'light');
      // Permit only this anonymous verified origin; abort external comments/fonts and redirects.
      await context.route('**/*', async (route) => {
        const request = route.request();
        if (new URL(request.url()).origin !== origin || request.redirectedFrom()) return route.abort();
        await route.continue({ headers: { ...request.headers(), ...headers } });
      });
      const page = await context.newPage();
      await page.goto(`${origin}/posts/image-lightbox-demo/`);
      assert.equal(await page.locator('html').getAttribute('data-feature-preview-sha'), local.framework_sha);
      await page.waitForFunction((dark) => document.documentElement.classList.contains('dark') === dark, dark);
      assert.equal(await page.locator('.prose-terminal a:has(img) button').count(), 0, 'Existing image links must remain links');
      const opener = page.locator('.article-image-trigger').first();
      const imageUrl = await opener.locator('img').evaluate(image => image.currentSrc || image.src);
      assert.equal(new URL(imageUrl).origin, origin);
      const imageResponse = await fetchAnonymous(imageUrl, propagation);
      assert.equal(imageResponse.status, 200, 'Synthetic article image must load anonymously');
      await opener.click();
      const dialog = page.getByRole('dialog', { name: '图片查看器' });
      await dialog.waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY), 'hidden');
      const toolbar = dialog.locator('[data-panzoom-controls]');
      assert.equal(await toolbar.getByRole('button').count(), 3);
      for (const auxiliary of [dialog.locator('figure'), toolbar.locator('output')]) {
        const bounds = await auxiliary.boundingBox();
        assert.ok(bounds && bounds.width <= 1 && bounds.height <= 1, 'Footer descriptions must be visually clipped');
      }
      const zoomIn = dialog.getByRole('button', { name: '放大图片' });
      await zoomIn.waitFor();
      await page.waitForFunction(() => !document.querySelector('[data-panzoom-controls]').disabled);
      const scale = () => page.locator('[data-panzoom-content]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a);
      await zoomIn.click();
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-panzoom-content]')).transform).a > 1);
      const zoomed = await scale();
      const frame = page.locator('[data-panzoom-content]');
      const initialStyle = await frame.getAttribute('style');
      const box = await page.locator('[data-panzoom-stage]').boundingBox();
      assert.ok(box, 'Viewer stage must fit the viewport');
      const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      await page.mouse.move(center.x, center.y);
      await page.mouse.down();
      await page.mouse.move(center.x + 40, center.y + 30, { steps: 5 });
      await page.mouse.up();
      assert.notEqual(await frame.getAttribute('style'), initialStyle, 'Zoomed picture must pan');
      await dialog.getByRole('button', { name: '重置适配视图' }).click();
      await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-panzoom-content]')).transform).a === 1);
      let pinch = false;
      if (width === 390) {
        const session = await context.newCDPSession(page);
        const dispatch = async (type, touchPoints) => {
          await session.send('Input.dispatchTouchEvent', { type, touchPoints });
          await page.evaluate(() => new Promise(requestAnimationFrame));
        };
        const touches = distance => [{ x: center.x - distance, y: center.y, id: 1 }, { x: center.x + distance, y: center.y, id: 2 }];
        await dispatch('touchStart', touches(25));
        for (const distance of [35, 50, 70, 90]) await dispatch('touchMove', touches(distance));
        await dispatch('touchEnd', []);
        await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-panzoom-content]')).transform).a > 1.2);
        const beforePan = await frame.getAttribute('style');
        await dispatch('touchStart', [{ ...center, id: 1 }]);
        await dispatch('touchMove', [{ x: center.x + 60, y: center.y + 50, id: 1 }]);
        await dispatch('touchEnd', []);
        assert.notEqual(await frame.getAttribute('style'), beforePan, 'Touch panning must move the zoomed image');
        await page.locator('[data-panzoom-stage]').press('0');
        await page.waitForFunction(() => new DOMMatrix(getComputedStyle(document.querySelector('[data-panzoom-content]')).transform).a === 1);
        pinch = true;
        await session.detach();
      }
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      if (!isThemePreview) await page.screenshot({ path: `preview-evidence/viewer-${width}-${dark ? 'dark' : 'light'}.png` });
      else if (width === 1440 && !dark) await page.screenshot({ path: 'preview-evidence/viewer-light.png' });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate((element) => element === document.activeElement), true);
      for (let repeat = 0; repeat < 2; repeat++) {
        await opener.press('Enter');
        await dialog.waitFor({ state: 'visible' });
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden' });
        assert.equal(await opener.evaluate(element => element === document.activeElement), true);
      }
      await page.locator('.prose-terminal a:has(img)').first().press('Enter');
      await page.waitForURL(/\/posts\/hello-world\/?$/);
      assert.ok(page.url().includes('/posts/hello-world'), 'Linked article image must navigate');
      await page.goBack();
      await page.waitForFunction(() => document.querySelectorAll('.article-image-trigger').length === 4);
      assert.equal(await page.locator('dialog[data-image-lightbox]').count(), 1, 'Navigation cannot duplicate the viewer');
      await opener.press('Enter');
      await dialog.waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await opener.evaluate(element => element === document.activeElement), true);
      measurements.push({ width, theme: dark ? 'dark' : 'light', zoomed, reset: 1, pan: true, mobile_pinch: pinch, focus_returned: true, repeated_open_close: 3, astro_navigation: true, linked_image_preserved: true, anonymous_image: true });
      if (isThemePreview) {
        let screenshot;
        if (width === 1440 && dark) {
          await page.goto(`${origin}/`);
          screenshot = 'terminal-blog.png';
        } else if (width === 1440 && !dark) {
          await page.goto(`${origin}/posts/hello-world/`);
          await page.locator('[data-blog-mermaid-complete="true"]').waitFor();
          screenshot = 'article-light.png';
        } else if (width === 390 && dark) {
          await page.locator('article').scrollIntoViewIfNeeded();
          screenshot = 'mobile-dark.png';
        }
        if (screenshot) {
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({ path: `preview-evidence/${screenshot}` });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const record = { framework_sha: local.framework_sha, preview_url: origin, fixture_url: `${origin}/posts/image-lightbox-demo/`, mode: 'preview', content_source: 'repository-demo', profile: 'template', browser: 'Chromium', hosted_acceptance: 'passed', anonymous: true, stable_url: PUBLIC_ORIGIN, html_routes: routes.length, measurements };
await writeFile('preview-evidence/deployment-record.json', JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record));
