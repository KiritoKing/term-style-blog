import { expect, test } from '@playwright/test';

test('terminal echo and restored history render markup as text', async ({ page }) => {
  await page.goto('/');
  const payload = '<img src=x onerror="window.__terminalXss=1">';
  const input = page.getByRole('textbox', { name: 'Terminal command input' }).filter({ visible: true });
  await input.fill(`echo ${payload}`);
  await input.press('Enter');
  await expect(page.getByText(payload, { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, '__terminalXss'))).toBeUndefined();
  await page.reload();
  await expect(page.getByText(payload, { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, '__terminalXss'))).toBeUndefined();
});

test('terminal rejects script and external navigation commands', async ({ page }) => {
  await page.goto('/');
  const origin = page.url();
  const input = page.getByRole('textbox', { name: 'Terminal command input' }).filter({ visible: true });
  for (const command of [
    'cd javascript:window.__terminalXss=1',
    'cd //example.invalid',
    'cat javascript:window.__terminalXss=1.md',
    'cat ../../javascript:window.__terminalXss=1.md',
  ]) {
    await input.fill(command);
    await input.press('Enter');
    await expect(input).toHaveValue('');
    // Navigation is deliberately delayed by 80 ms in the real terminal.
    await page.waitForTimeout(150);
    expect(page.url()).toBe(origin);
    expect(await page.evaluate(() => Reflect.get(window, '__terminalXss'))).toBeUndefined();
  }
});

test('terminal search encodes markup as a query rather than a navigation target', async ({ page }) => {
  await page.goto('/');
  const origin = new URL(page.url()).origin;
  const query = 'javascript:window.__terminalXss=1 <img src=x onerror="window.__terminalXss=1">';
  const input = page.getByRole('textbox', { name: 'Terminal command input' }).filter({ visible: true });
  await input.fill(`grep ${query}`);
  await input.press('Enter');
  await expect(page).toHaveURL(/\/search\?q=/);
  const target = new URL(page.url());
  expect(target.origin).toBe(origin);
  expect(target.pathname).toBe('/search');
  expect(target.searchParams.get('q')).toBe(query);
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  expect(await page.evaluate(() => Reflect.get(window, '__terminalXss'))).toBeUndefined();
});
