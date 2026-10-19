import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const realBlogFlowcharts = JSON.parse(
  readFileSync(new URL('../fixtures/mermaid/real-blog-flowcharts.json', import.meta.url), 'utf8'),
) as string[];

const installDiagrams = async (page: Page, sources: string[]) => {
  await page.evaluate((diagrams) => {
    const article = document.querySelector('.prose-terminal');
    if (!article) throw new Error('The article container is missing.');

    article.replaceChildren(
      ...diagrams.map((source) => {
        const pre = document.createElement('pre');
        pre.dataset.language = 'mermaid';
        pre.textContent = source;
        return pre;
      }),
    );
    document.dispatchEvent(new Event('astro:page-load'));
  }, sources);

  await expect(page.locator('.prose-terminal .mermaid[data-blog-mermaid-complete="true"]')).toHaveCount(
    sources.length,
  );
};

test('renders the four public Chinese flowcharts with readable mobile and desktop layouts', async ({ page }) => {
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/posts/hello-world', { waitUntil: 'domcontentloaded' });
  await installDiagrams(page, realBlogFlowcharts);

  const mobile = await page.locator('.prose-terminal .mermaid').evaluateAll((diagrams) =>
    diagrams.map((diagram) => {
      const svg = diagram.querySelector<SVGSVGElement>(':scope > svg.pele');
      if (!svg) throw new Error('Pele did not render an SVG.');
      const label = svg.querySelector('.pele-label');
      const labelBox = label?.getBoundingClientRect();
      return {
        renderer: (diagram as HTMLElement).dataset.blogMermaidRenderer,
        width: svg.getBoundingClientRect().width,
        height: svg.getBoundingClientRect().height,
        containerWidth: diagram.clientWidth,
        labelHeight: labelBox?.height ?? 0,
        text: svg.textContent ?? '',
      };
    }),
  );

  expect(mobile).toHaveLength(4);
  const expectedLabels = ['电力', '目标与上下文', '传统职能池', '原始想法'];
  for (const [index, diagram] of mobile.entries()) {
    expect(diagram.renderer).toBe('pele');
    expect(diagram.width).toBeGreaterThan(0);
    expect(diagram.height).toBeGreaterThan(0);
    expect(diagram.width).toBeLessThan(5_000);
    expect(diagram.labelHeight).toBeGreaterThanOrEqual(12);
    expect(diagram.text).toContain(expectedLabels[index]);
  }

  await page.evaluate(() => {
    const diagram = document.querySelector<HTMLElement>('.prose-terminal .mermaid');
    const svg = diagram?.querySelector<SVGSVGElement>(':scope > svg');
    if (!diagram || !svg) throw new Error('The first diagram is missing.');
    const light = getComputedStyle(svg).getPropertyValue('--pele-fg').trim();
    document.documentElement.classList.add('dark');
    const dark = getComputedStyle(svg).getPropertyValue('--pele-fg').trim();
    document.documentElement.classList.remove('dark');
    if (light !== '#374151' || dark !== '#d1d5db') throw new Error(`Theme variables did not update: ${light} / ${dark}`);
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(() => page.locator('.prose-terminal .mermaid svg.pele').first().evaluate((svg) => svg.getBoundingClientRect().width)).toBeGreaterThan(0);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test('retains safe links, blocks dangerous URLs, and falls back for legacy Mermaid directives', async ({ page }) => {
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  await page.goto('/posts/hello-world', { waitUntil: 'domcontentloaded' });
  await installDiagrams(page, [
    `flowchart LR
      A[Safe external link] --> B[Finished]
      click A "https://example.com"`,
    `flowchart LR
      A[Unsafe link] --> B[Finished]
      click A "javascript:alert(1)"`,
    `%%{init: {'theme': 'dark'}}%%
      flowchart LR
      A[Legacy theme directive] --> B[Fallback renderer]`,
  ]);

  const diagrams = page.locator('.prose-terminal .mermaid');
  await expect(diagrams.nth(0)).toHaveAttribute('data-blog-mermaid-renderer', 'pele');
  await expect(diagrams.nth(1)).toHaveAttribute('data-blog-mermaid-renderer', 'pele');
  await expect(diagrams.nth(2)).toHaveAttribute('data-blog-mermaid-renderer', 'mermaid-fallback');
  await expect(diagrams.nth(0).locator('svg a')).toHaveAttribute('href', 'https://example.com/');
  await expect(diagrams.nth(0).locator('svg a')).toHaveAttribute('rel', /noopener/);
  await expect(diagrams.nth(1).locator('svg a[href^="javascript:"]')).toHaveCount(0);
  await expect(diagrams.nth(2).locator('svg')).toBeVisible();
});
