import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const realBlogFlowcharts = JSON.parse(
  readFileSync(new URL('../fixtures/mermaid/real-blog-flowcharts.json', import.meta.url), 'utf8'),
) as string[];

const installDiagrams = async (page: Page, sources: string[], expectPreview = true) => {
  await page.evaluate((diagrams) => {
    const article = document.querySelector('.prose-terminal');
    if (!article) throw new Error('The article container is missing.');

    const state = window as Window & { __mermaidRenderEvents?: number; __mermaidRenderCounts?: number[] };
    state.__mermaidRenderEvents = 0;
    state.__mermaidRenderCounts = [];
    document.addEventListener('blog:mermaid-rendered', (event) => {
      state.__mermaidRenderEvents = (state.__mermaidRenderEvents ?? 0) + 1;
      state.__mermaidRenderCounts?.push((event as CustomEvent<{ count?: number }>).detail?.count ?? 0);
    });

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

  if (expectPreview) {
    await expect(page.locator('.prose-terminal .mermaid[data-blog-mermaid-complete="true"]')).toHaveCount(
      sources.length,
    );
  } else {
    await expect(page.locator('.prose-terminal pre[data-blog-mermaid-error="true"]')).toHaveCount(sources.length);
  }
};

test('renders the four public Chinese flowcharts with readable mobile and desktop layouts', async ({ page }) => {
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/posts/hello-world', { waitUntil: 'domcontentloaded' });
  await installDiagrams(page, realBlogFlowcharts);
  await expect.poll(() => page.evaluate(() => (window as Window & { __mermaidRenderEvents?: number }).__mermaidRenderEvents)).toBe(1);
  expect(await page.evaluate(() => (window as Window & { __mermaidRenderCounts?: number[] }).__mermaidRenderCounts)).toEqual([4]);

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

test('retains safe links and blocks dangerous URLs', async ({ page }) => {
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
  ]);

  const diagrams = page.locator('.prose-terminal .mermaid');
  await expect(diagrams).toHaveCount(2);
  await expect(diagrams.nth(0).locator('svg a')).toHaveAttribute('href', 'https://example.com/');
  await expect(diagrams.nth(0).locator('svg a')).toHaveAttribute('rel', /noopener/);
  await expect(diagrams.nth(1).locator('svg a[href^="javascript:"]')).toHaveCount(0);
});

test('keeps the original source visible when Pele chunk loading fails', async ({ page }) => {
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  await page.route('**/_astro/lazy.*.js', (route) => route.abort());
  await page.goto('/posts/hello-world', { waitUntil: 'domcontentloaded' });
  await installDiagrams(page, [realBlogFlowcharts[0]], false);

  const source = page.locator('.prose-terminal pre[data-blog-mermaid-error="true"]');
  await expect(source).toContainText('电力');
  await expect(page.getByRole('status')).toContainText('Mermaid source is shown below');
  await expect(page.locator('.prose-terminal .mermaid svg')).toHaveCount(0);
});

test('ignores Pele module completion after two Astro navigations', async ({ page }) => {
  let releaseChunk: (() => void) | undefined;
  let resolveChunkRequest: (() => void) | undefined;
  const chunkRequested = new Promise<void>((resolve) => {
    resolveChunkRequest = resolve;
  });
  const heldChunk = new Promise<void>((resolve) => {
    releaseChunk = resolve;
  });

  await page.addInitScript(() => {
    const state = window as Window & { __mermaidRenderEvents?: number };
    state.__mermaidRenderEvents = 0;
    document.addEventListener('blog:mermaid-rendered', () => {
      state.__mermaidRenderEvents = (state.__mermaidRenderEvents ?? 0) + 1;
    });
    document.addEventListener('astro:page-load', () => {
      const article = document.querySelector('.prose-terminal');
      if (!article || article.querySelector('[data-test-next-article]')) return;
      const link = document.createElement('a');
      link.dataset.testNextArticle = 'true';
      link.href = location.pathname === '/posts/pixel-art-tips' ? '/posts/hello-world-cn' : '/posts/pixel-art-tips';
      link.textContent = 'Next test article';
      article.append(link);
    });
  });
  await page.route('**/*', (route) =>
    new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort(),
  );
  await page.route('**/_astro/lazy.*.js', async (route) => {
    resolveChunkRequest?.();
    await heldChunk;
    await route.continue();
  });
  await page.goto('/posts/hello-world', { waitUntil: 'domcontentloaded' });
  await page.evaluate((source) => {
    const article = document.querySelector('.prose-terminal');
    if (!article) throw new Error('The article container is missing.');
    const pre = document.createElement('pre');
    pre.dataset.language = 'mermaid';
    pre.textContent = source;
    article.replaceChildren(pre);
    document.dispatchEvent(new Event('astro:page-load'));
  }, realBlogFlowcharts[0]);
  await chunkRequested;

  await page.locator('[data-test-next-article]').click();
  await expect(page).toHaveURL(/\/posts\/pixel-art-tips\/?$/);
  await page.locator('[data-test-next-article]').click();
  await expect(page).toHaveURL(/\/posts\/hello-world-cn\/?$/);

  releaseChunk?.();
  await expect(page.locator('.prose-terminal .mermaid')).toHaveCount(0);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => (window as Window & { __mermaidRenderEvents?: number }).__mermaidRenderEvents)).toBe(0);
});
