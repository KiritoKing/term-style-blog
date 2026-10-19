import { expect, test } from '@playwright/test';

test('top bar controls respond when React hydration is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('tsb:theme', 'dark');
  });
  await page.route('**/_astro/client.*.js', (route) => route.abort());
  await page.goto('/');

  const root = page.locator('html');
  await expect(root).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Toggle Theme' }).click();
  await expect(root).not.toHaveClass(/dark/);

  const accessibility = page.getByRole('button', { name: 'Toggle Accessibility Mode' });
  await accessibility.click();
  await expect(accessibility).toHaveAttribute('aria-pressed', 'true');
  await expect(accessibility).toHaveClass(/text-blue-600/);
  await expect(accessibility).toHaveClass(/dark:text-green-400/);
  await expect(accessibility).toHaveClass(/bg-gray-300/);
  await expect(accessibility).toHaveClass(/dark:bg-\[\#222\]/);
  await expect(page.locator('body')).toHaveClass(/font-mode-system/);

  await page.reload();
  const restoredAccessibility = page.getByRole('button', { name: 'Toggle Accessibility Mode' });
  await expect(restoredAccessibility).toHaveAttribute('aria-pressed', 'true');
  await expect(restoredAccessibility).toHaveClass(/text-blue-600/);
  await expect(restoredAccessibility).toHaveClass(/bg-gray-300/);
});

test('uses one responsive terminal across viewport changes and Astro navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const terminal = page.locator('[data-shell-terminal]');
  await expect(terminal).toHaveCount(1);
  await expect(terminal.locator('astro-island')).toHaveCount(1);
  await expect(terminal).not.toHaveAttribute('open', '');
  await terminal.locator('summary').click();
  const input = terminal.getByRole('textbox', { name: 'Terminal command input' });
  await input.fill('echo mobile-terminal');
  await input.press('Enter');
  await expect(terminal.getByText('mobile-terminal', { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(terminal).toHaveAttribute('open', '');
  await expect(terminal.locator('astro-island')).toHaveCount(1);
  const wasDark = await page.locator('html').evaluate((element) => element.classList.contains('dark'));
  await page.getByRole('button', { name: 'Toggle Theme' }).click();
  await expect
    .poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark')))
    .toBe(!wasDark);
  const selectedTheme = !wasDark;

  await page.getByRole('link', { name: '~/posts', exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/?$/);
  await expect(page.locator('[data-shell-terminal]')).toHaveCount(1);
  await expect
    .poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark')))
    .toBe(selectedTheme);

  await page.goBack();
  await expect(page).toHaveURL(/\/($|\?)/);
  await expect(page.locator('[data-shell-terminal]')).toHaveCount(1);
  await expect
    .poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark')))
    .toBe(selectedTheme);
});

test('storage exceptions do not prevent theme controls or terminal commands', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
    };
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  const wasDark = await page.locator('html').evaluate((element) => element.classList.contains('dark'));
  await page.getByRole('button', { name: 'Toggle Theme' }).click();
  await expect
    .poll(() => page.locator('html').evaluate((element) => element.classList.contains('dark')))
    .toBe(!wasDark);
  const input = page.getByRole('textbox', { name: 'Terminal command input' }).first();
  await input.fill('echo storage-safe');
  await input.press('Enter');
  await expect(page.getByText('storage-safe', { exact: true }).first()).toBeVisible();
  await input.fill('cd posts');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/posts\/?$/);
  expect(errors).toEqual([]);
});
