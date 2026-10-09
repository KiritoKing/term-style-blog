import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const demo = '/posts/image-lightbox-demo';
const dialog = (page: Page) => page.getByRole('dialog', { name: '图片查看器' });
const invokers = (page: Page) => page.locator('.prose-terminal button[command="show-modal"]');

test.beforeEach(async ({ page }) => {
  // All image fixtures are local; external comments/fonts are unrelated to this regression.
  await page.route('https://giscus.app/**', (route) => route.abort());
});

test('lightbox opens original image and preserves alt, title and lazy attributes', async ({ page }) => {
  await page.goto(demo);
  await expect(invokers(page)).toHaveCount(4);
  const original = invokers(page).first().locator('img');
  const attributes = await original.evaluate((img) => img.outerHTML);
  await expect(invokers(page).nth(2).locator('img')).toHaveAttribute('loading', 'lazy');
  await invokers(page).first().click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).locator('img')).toHaveAttribute('alt', '终端山景合成横图');
  await expect(dialog(page).locator('figcaption')).toHaveText('终端山景 · 1600 × 900');
  await expect.poll(() => dialog(page).locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1600);
  expect(await original.evaluate((img) => img.outerHTML)).toBe(attributes);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).not.toBeVisible();
  await expect(invokers(page).first()).toBeFocused();
});

test('lightbox keyboard, inert background and all close paths restore focus repeatedly', async ({ page }) => {
  await page.goto(demo);
  const opener = invokers(page).first();
  for (const key of ['Enter', 'Space', 'Enter']) {
    await opener.focus();
    await opener.press(key);
    await expect(dialog(page)).toBeVisible();
    const close = dialog(page).getByRole('button', { name: '关闭图片查看器' });
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await dialog(page).evaluate((element) => element.contains(document.activeElement))).toBe(true);
    const focused = await page.evaluate(() => document.activeElement?.outerHTML);
    await page.locator('article h1').evaluate((heading: HTMLElement) => { heading.tabIndex = 0; heading.focus(); });
    expect(await page.evaluate(() => document.activeElement?.outerHTML)).toBe(focused);
    if (key === 'Space') await close.click();
    else await page.keyboard.press('Escape');
    await expect(dialog(page)).not.toBeVisible();
    await expect(opener).toBeFocused();
  }
  await opener.click();
  await dialog(page).locator('img').click();
  await expect(dialog(page)).toBeVisible();
  // A drag which starts on the image and ends outside must not dismiss the viewer.
  const box = await dialog(page).locator('img').boundingBox();
  if (!box) throw new Error('Viewer image is missing');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(2, 2);
  await page.mouse.up();
  await expect(dialog(page)).toBeVisible();
  await page.mouse.click(2, 2);
  await expect(dialog(page)).not.toBeVisible();
  await expect(opener).toBeFocused();
});

for (const theme of ['light', 'dark']) {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    test(`lightbox fits wide and tall images in ${theme} at ${viewport.width}px and locks reading scroll`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme === 'dark' ? 'dark' : 'light' });
      await page.addInitScript((theme) => localStorage.setItem('tsb:theme', theme), theme);
      await page.goto(demo);
      await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(theme === 'dark');
      for (const index of [0, 1]) {
        await invokers(page).nth(index).click();
        await expect(dialog(page)).toBeVisible();
        const image = dialog(page).locator('img');
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        const geometry = await dialog(page).evaluate((element) => {
          const img = element.querySelector('img');
          if (!img) throw new Error('Missing viewer image');
          const rect = element.getBoundingClientRect();
          const imageRect = img.getBoundingClientRect();
          return {
            right: rect.right, bottom: rect.bottom, left: rect.left, top: rect.top,
            imageRight: imageRect.right, imageBottom: imageRect.bottom,
            overflow: element.scrollWidth - element.clientWidth,
            pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            documentLock: getComputedStyle(document.documentElement).overflowY,
            readingLocks: Array.from(document.querySelectorAll('[data-terminal-shell] .overflow-y-auto')).map((scroller) => getComputedStyle(scroller).overflowY),
          };
        });
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.top).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(viewport.width);
        expect(geometry.bottom).toBeLessThanOrEqual(viewport.height);
        expect(geometry.imageRight).toBeLessThanOrEqual(geometry.right);
        expect(geometry.imageBottom).toBeLessThanOrEqual(geometry.bottom);
        expect(geometry.overflow).toBeLessThanOrEqual(1);
        expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
        expect(geometry.documentLock).toBe('hidden');
        expect(await dialog(page).evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(theme === 'dark' ? 'rgb(10, 10, 10)' : 'rgb(255, 255, 255)');
        expect(geometry.readingLocks.every((lock) => lock === 'hidden')).toBe(true);
        await expect(dialog(page).getByRole('button', { name: '关闭图片查看器' })).toBeInViewport();
        const shot = testInfo.outputPath(`lightbox-${theme}-${viewport.width}-${index}.png`);
        await page.screenshot({ path: shot });
        await testInfo.attach('viewer', { path: shot, contentType: 'image/png' });
        await page.keyboard.press('Escape');
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden');
      }
    });
  }
}

test('lightbox supports data images, alt captions and generic empty-alt labels', async ({ page }) => {
  await page.goto(demo);
  await invokers(page).nth(1).click();
  await expect(dialog(page).locator('figcaption')).toHaveText('终端清单合成竖图');
  await page.keyboard.press('Escape');
  await invokers(page).nth(2).click();
  await expect(dialog(page).locator('img')).toHaveAttribute('src', /^data:image\/png;base64,/);
  await expect(dialog(page).locator('figcaption')).toHaveText('内嵌图片标题');
  await page.keyboard.press('Escape');
  await expect(invokers(page).last()).toHaveAccessibleName('查看大图');
  await invokers(page).last().click();
  await expect(dialog(page).locator('figcaption')).toHaveText('图片');
});

test('lightbox preserves linked images and initializes once after Astro navigation back', async ({ page }) => {
  await page.goto(demo);
  await page.evaluate(() => { for (let i = 0; i < 3; i++) document.dispatchEvent(new Event('astro:page-load')); });
  await expect(invokers(page)).toHaveCount(4);
  const linked = page.locator('.prose-terminal a:has(img)');
  await expect(linked.locator('button')).toHaveCount(0);
  await linked.click();
  await expect(page).toHaveURL(/\/posts\/hello-world$/);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${demo}$`));
  await expect(invokers(page)).toHaveCount(4);
  await invokers(page).first().click();
  await page.keyboard.press('Escape');
  await expect(invokers(page).first()).toBeFocused();
  // Swap away while open: no stale modal/scroll lock may survive.
  await invokers(page).first().click();
  await page.evaluate(async () => {
    const link = document.querySelector<HTMLAnchorElement>('.prose-terminal a:has(img)');
    link?.click();
  });
  await expect(page).toHaveURL(/\/posts\/hello-world$/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).not.toBe('hidden');
  await page.goBack();
  await invokers(page).first().click();
  await expect(dialog(page)).toBeVisible();
});

test('lightbox enhancement leaves no-JS and unsupported-command content readable', async ({ browser }) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    if (javaScriptEnabled) await context.addInitScript(() => { Reflect.deleteProperty(HTMLButtonElement.prototype, 'commandForElement'); });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4321${demo}`);
    await expect(page.locator('.prose-terminal img')).toHaveCount(5);
    await expect(invokers(page)).toHaveCount(0);
    await expect(page.locator('.prose-terminal img').first()).toBeVisible();
    await page.locator('.prose-terminal a:has(img)').click();
    await expect(page).toHaveURL(/\/posts\/hello-world$/);
    await context.close();
  }
});

test('lightbox open dialog passes axe smoke in both themes', async ({ page }) => {
  await page.goto(demo);
  for (const dark of [false, true]) {
    await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark);
    await invokers(page).first().click();
    await expect(dialog(page)).toBeVisible();
    const results = await new AxeBuilder({ page }).include('[data-image-lightbox]').analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press('Escape');
  }
});

const scale = (page: Page) => page.locator('[data-panzoom-content]').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a);

test('lightbox lazy panzoom supports buttons, wheel, bounded drag, reset and reopen', async ({ page }) => {
  const chunks: string[] = [];
  page.on('request', (request) => { if (request.url().includes('image-panzoom')) chunks.push(request.url()); });
  await page.goto(demo);
  expect(chunks).toEqual([]);
  await expect(invokers(page)).toHaveCount(4);
  await invokers(page).first().click();
  const zoomIn = dialog(page).getByRole('button', { name: '放大图片' });
  const zoomOut = dialog(page).getByRole('button', { name: '缩小图片' });
  const reset = dialog(page).getByRole('button', { name: '重置适配视图' });
  await expect(zoomIn).toBeEnabled();
  expect(chunks.length).toBeGreaterThan(0);
  await zoomIn.click();
  await expect.poll(() => scale(page)).toBeGreaterThan(1);
  const stage = page.locator('[data-panzoom-stage]');
  await stage.hover();
  const beforeWheel = await scale(page);
  await page.mouse.wheel(0, -150);
  await expect.poll(() => scale(page)).toBeGreaterThan(beforeWheel);
  while (await zoomIn.isEnabled()) {
    const previous = await scale(page);
    await zoomIn.click();
    await expect.poll(() => scale(page)).toBeGreaterThan(previous);
  }
  await expect.poll(() => scale(page)).toBe(5);
  await expect(zoomIn).toBeDisabled();
  const box = await stage.boundingBox();
  if (!box) throw new Error('Missing stage');
  const frame = page.locator('[data-panzoom-content]');
  const initial = await frame.getAttribute('style');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width, box.y + box.height, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => frame.getAttribute('style')).not.toBe(initial);
  const bounds = await frame.boundingBox();
  if (!bounds) throw new Error('Missing transformed frame');
  expect(bounds.x).toBeLessThanOrEqual(box.x + 1);
  expect(bounds.y).toBeLessThanOrEqual(box.y + 1);
  expect(bounds.x + bounds.width).toBeGreaterThanOrEqual(box.x + box.width - 1);
  expect(bounds.y + bounds.height).toBeGreaterThanOrEqual(box.y + box.height - 1);
  await reset.click();
  await expect.poll(() => scale(page)).toBe(1);
  await expect(zoomOut).toBeDisabled();
  await stage.focus();
  await stage.press('+');
  await expect.poll(() => scale(page)).toBeGreaterThan(1);
  await stage.press('ArrowRight');
  await stage.press('0');
  await expect.poll(() => scale(page)).toBe(1);
  await page.mouse.wheel(0, 10000);
  await expect.poll(() => scale(page)).toBe(1);
  await zoomIn.click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => scale(page)).toBe(1);
  await page.keyboard.press('Escape');
  await invokers(page).nth(1).click();
  await expect(zoomIn).toBeEnabled();
  await expect.poll(() => scale(page)).toBe(1);
});

test('lightbox mobile two-finger pinch and one-finger pan use real touch input', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:4321${demo}`);
  await invokers(page).first().tap();
  await expect(dialog(page).getByRole('button', { name: '放大图片' })).toBeEnabled();
  // Native taps are verified before CDP gestures: system Chromium also
  // suppresses a tap after CDP drag on a plain HTML button without app code.
  await dialog(page).getByRole('button', { name: '放大图片' }).tap();
  await expect.poll(() => scale(page)).toBeGreaterThan(1);
  await dialog(page).getByRole('button', { name: '重置适配视图' }).tap();
  await expect.poll(() => scale(page)).toBe(1);
  await dialog(page).getByRole('button', { name: '关闭图片查看器' }).tap();
  await expect(invokers(page).first()).toBeFocused();
  await invokers(page).first().tap();
  await expect(dialog(page).getByRole('button', { name: '放大图片' })).toBeEnabled();
  const stage = page.locator('[data-panzoom-stage]');
  const box = await stage.boundingBox();
  if (!box) throw new Error('Missing touch stage');
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const session = await context.newCDPSession(page);
  const dispatch = async (type: 'touchStart' | 'touchMove' | 'touchEnd', touchPoints: { x: number; y: number; id: number }[]) => {
    await session.send('Input.dispatchTouchEvent', { type, touchPoints });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  };
  const touches = (distance: number) => [
    { x: center.x - distance, y: center.y, id: 1 },
    { x: center.x + distance, y: center.y, id: 2 },
  ];
  await dispatch('touchStart', touches(25));
  for (const distance of [35, 50, 70, 90]) {
    await dispatch('touchMove', touches(distance));
  }
  await dispatch('touchEnd', []);
  await expect.poll(() => scale(page)).toBeGreaterThan(1.2);
  expect(await scale(page)).toBeLessThanOrEqual(5);
  const frame = page.locator('[data-panzoom-content]');
  const initial = await frame.getAttribute('style');
  await dispatch('touchStart', [{ ...center, id: 1 }]);
  await dispatch('touchMove', [{ x: center.x + 60, y: center.y + 50, id: 1 }]);
  await dispatch('touchEnd', []);
  await expect.poll(() => frame.getAttribute('style')).not.toBe(initial);
  await stage.focus();
  await stage.press('0');
  await expect.poll(() => scale(page)).toBe(1);
  await page.keyboard.press('Escape');
  await expect(invokers(page).first()).toBeFocused();
  await context.close();
});

test('lightbox ignores a delayed zoom import after closing and reopens cleanly', async ({ page }) => {
  let release: () => void = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/image-panzoom*.js', async (route) => { await pending; await route.continue(); });
  await page.goto(demo);
  await invokers(page).first().click();
  await page.keyboard.press('Escape');
  release();
  await expect(dialog(page)).not.toBeVisible();
  await expect(invokers(page).first()).toBeFocused();
  await invokers(page).nth(1).click();
  await expect(dialog(page).getByRole('button', { name: '放大图片' })).toBeEnabled();
  await expect.poll(() => scale(page)).toBe(1);
  await page.keyboard.press('Escape');
});
