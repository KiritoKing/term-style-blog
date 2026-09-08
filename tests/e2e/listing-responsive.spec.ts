import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const listingTemplates = [
  'src/pages/posts/index.astro',
  'src/pages/posts/page/[page].astro',
  'src/pages/categories/index.astro',
  'src/pages/categories/page/[page].astro',
  'src/pages/categories/[slug].astro',
  'src/pages/categories/[slug]/page/[page].astro',
  'src/pages/tags/index.astro',
  'src/pages/tags/page/[page].astro',
  'src/pages/tags/[slug].astro',
  'src/pages/tags/[slug]/page/[page].astro',
];

const defaultRoutes = ['/posts', '/categories', '/tags'];
const realCorpusRoutes = [
  ...defaultRoutes,
  '/posts/page/2',
  '/categories/development',
  '/categories/development/page/2',
  '/tags/javascript',
  '/tags/javascript/page/2',
  '/tags/page/2',
];

test('all listing templates share the responsive terminal-column contract', async () => {
  for (const template of listingTemplates) {
    const source = await readFile(template, 'utf8');
    expect(source, template).toContain('data-listing-table');
    expect(source, template).toContain('data-listing-row');
    expect(source, template).toMatch(
      /class="[^"]*hidden md:inline-block[^"]*whitespace-nowrap[^"]*" data-listing-permissions/,
    );
    expect(source, template).toMatch(
      /class="[^"]*hidden md:inline-block[^"]*whitespace-nowrap[^"]*" data-listing-owner/,
    );
    expect(source, template).toMatch(
      /class="[^"]*whitespace-nowrap[^"]*" data-listing-(date|count)/,
    );
  }
});

for (const viewport of [
  { name: 'mobile', size: { width: 390, height: 844 }, secondaryColumnsVisible: false },
  { name: 'desktop', size: { width: 1440, height: 900 }, secondaryColumnsVisible: true },
] as const) {
  test(`listing columns remain legible without content-pane overflow on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport.size);
    const routes = process.env.E2E_REAL_LISTINGS === '1' ? realCorpusRoutes : defaultRoutes;

    for (const route of routes) {
      await page.goto(route);
      const table = page.locator('[data-listing-table]');
      const permissions = table.locator('[data-listing-header] [data-listing-permissions]');
      const owner = table.locator('[data-listing-header] [data-listing-owner]');
      const primaryMeta = table.locator(
        '[data-listing-header] [data-listing-date], [data-listing-header] [data-listing-count]',
      );

      await expect(table, route).toBeVisible();
      await expect(primaryMeta, route).toBeVisible();
      if (viewport.secondaryColumnsVisible) {
        await expect(permissions, route).toBeVisible();
        await expect(owner, route).toBeVisible();
      } else {
        await expect(permissions, route).toBeHidden();
        await expect(owner, route).toBeHidden();
      }

      const geometry = await table.evaluate((element) => {
        const content = element.closest<HTMLElement>('#content-scroll');
        const tableRect = element.getBoundingClientRect();
        const contentRect = content?.getBoundingClientRect();
        const visibleMeta = Array.from(
          element.querySelectorAll<HTMLElement>(
            '[data-listing-permissions], [data-listing-owner], [data-listing-date], [data-listing-count]',
          ),
        ).filter((cell) => cell.getBoundingClientRect().width > 0);
        if (!content || !contentRect) throw new Error('Listing content pane was not available.');
        return {
          paneOverflow: content.scrollWidth - content.clientWidth,
          beyondContentLeft: Math.max(0, contentRect.left - tableRect.left),
          beyondContentRight: Math.max(0, tableRect.right - contentRect.right),
          meta: visibleMeta.map((cell) => ({
            text: cell.textContent?.trim(),
            whiteSpace: getComputedStyle(cell).whiteSpace,
            lineCount: cell.getClientRects().length,
          })),
        };
      });

      expect(geometry.paneOverflow, route).toBeLessThanOrEqual(1);
      expect(geometry.beyondContentLeft, route).toBeLessThanOrEqual(1);
      expect(geometry.beyondContentRight, route).toBeLessThanOrEqual(1);
      expect(geometry.meta, route).not.toHaveLength(0);
      for (const cell of geometry.meta) {
        expect(cell.whiteSpace, `${route}: ${cell.text}`).toBe('nowrap');
        expect(cell.lineCount, `${route}: ${cell.text}`).toBe(1);
      }
    }
  });
}
