import { expect, test } from '@playwright/test';

const fixtureSlug = process.env.E2E_MERMAID_FIXTURE_SLUG ?? process.env.E2E_POST_SLUG ?? 'hello-world';

test('wide Mermaid diagrams keep readable scale inside a local scroller', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/posts/${fixtureSlug}`, { waitUntil: 'domcontentloaded' });

  const fixture = await page.locator('.prose-terminal').evaluate((prose) => {
    const container = document.createElement('div');
    container.className = 'mermaid';
    container.dataset.testFixture = 'wide-mermaid';
    container.dataset.blogMermaidComplete = 'true';
    container.innerHTML = `
      <svg width="100%" viewBox="0 0 1000 100" style="max-width: 1000px" aria-label="wide diagram">
        <rect x="0" y="0" width="1000" height="100" fill="transparent"></rect>
        <text x="10" y="50" font-size="16">Readable Mermaid node text</text>
      </svg>
    `;
    prose.append(container);
    return true;
  });
  expect(fixture).toBe(true);
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('blog:mermaid-rendered')));

  const container = page.locator('[data-test-fixture="wide-mermaid"]');
  await expect(container).toHaveAttribute('data-mermaid-scrollable', 'true');

  const geometry = await container.evaluate((element) => {
    const svg = element.querySelector('svg');
    const text = element.querySelector('text');
    if (!svg || !text) throw new Error('Mermaid fixture did not contain an SVG and text node.');
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      svgWidth: svg.getBoundingClientRect().width,
      textHeight: text.getBoundingClientRect().height,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(geometry.scrollWidth).toBeGreaterThan(geometry.clientWidth * 2);
  expect(geometry.svgWidth).toBeGreaterThanOrEqual(999);
  expect(geometry.textHeight).toBeGreaterThanOrEqual(14);
  expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
});

const realMermaidPosts = [
  { slug: 'ai-productivity-paradigm', diagramCount: 4 },
  { slug: 'codex-security-vertical-agent-customization', diagramCount: 4 },
  { slug: 'edge-model-runtime', diagramCount: 1 },
  { slug: 'how-node-resolve-modules', diagramCount: 2 },
  { slug: 'my-brand-new-blog-system', diagramCount: 1 },
];
const realCorpusEnabled = process.env.E2E_REAL_CORPUS === '1';

for (const { slug, diagramCount } of realMermaidPosts) {
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`${slug} has stable readable Mermaid geometry on ${viewport.name} cold loads`, async ({ browser }) => {
      test.skip(!realCorpusEnabled, 'requires the explicit real publication corpus');
      const measurements = await Promise.all(
        Array.from({ length: 3 }, async () => {
          const context = await browser.newContext({
            viewport,
            reducedMotion: 'reduce',
            colorScheme: 'light',
          });
          await context.route('**/*', async (route) => {
            const url = new URL(route.request().url());
            if (url.hostname === '127.0.0.1') await route.continue();
            else await route.abort();
          });
          const page = await context.newPage();
          await page.goto(`/posts/${slug}`, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);

          const diagrams = page.locator('.prose-terminal .mermaid');
          await expect(diagrams).toHaveCount(diagramCount);
          await expect(diagrams.first()).toHaveAttribute('data-blog-mermaid-complete', 'true');
          await expect(diagrams.first().locator(':scope > svg')).toBeVisible();

          const geometry = await diagrams.evaluateAll((containers) =>
            containers.map((container) => {
              const svg = container.querySelector<SVGSVGElement>(':scope > svg[viewBox]');
              if (!svg) throw new Error('Rendered Mermaid container is missing its SVG.');
              const labelHeight = Math.max(
                0,
                ...Array.from(svg.querySelectorAll<SVGGraphicsElement>('text, foreignObject, .nodeLabel')).map(
                  (label) => label.getBoundingClientRect().height,
                ),
              );
              const initialScrollLeft = container.scrollLeft;
              container.scrollLeft = container.scrollWidth;
              const endScrollLeft = container.scrollLeft;
              container.scrollLeft = initialScrollLeft;
              const viewBoxWidth = svg.viewBox.baseVal.width;
              return {
                clientWidth: container.clientWidth,
                scrollWidth: container.scrollWidth,
                viewBoxWidth,
                svgWidth: svg.getBoundingClientRect().width,
                labelHeight,
                endReachable:
                  container.scrollWidth <= container.clientWidth ||
                  Math.abs(endScrollLeft - (container.scrollWidth - container.clientWidth)) <= 1,
                transitionDuration: getComputedStyle(svg).transitionDuration,
                documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              };
            }),
          );
          await context.close();
          return geometry;
        }),
      );

      for (const load of measurements) {
        expect(load).toHaveLength(diagramCount);
        for (const diagram of load) {
          expect(diagram.viewBoxWidth).toBeGreaterThan(0);
          expect(diagram.viewBoxWidth).toBeLessThan(5_000);
          expect(diagram.svgWidth).toBeGreaterThan(0);
          expect(diagram.svgWidth).toBeLessThan(5_000);
          expect(diagram.scrollWidth).toBeLessThan(5_000);
          expect(diagram.scrollWidth).toBeLessThan(diagram.clientWidth * 16);
          if (diagram.viewBoxWidth > diagram.clientWidth) {
            expect(Math.abs(diagram.svgWidth - diagram.viewBoxWidth)).toBeLessThanOrEqual(2);
            expect(Math.abs(diagram.scrollWidth - Math.ceil(diagram.viewBoxWidth))).toBeLessThanOrEqual(2);
          }
          expect(diagram.labelHeight).toBeGreaterThanOrEqual(12);
          expect(diagram.endReachable).toBe(true);
          expect(diagram.transitionDuration).toBe('0s');
          expect(diagram.documentOverflow).toBeLessThanOrEqual(1);
        }
      }

      expect(measurements[1]).toEqual(measurements[0]);
      expect(measurements[2]).toEqual(measurements[0]);
    });
  }
}

test('Mermaid initializes again after article navigation', async ({ page }) => {
  test.skip(!realCorpusEnabled, 'requires the explicit real publication corpus');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/posts/ai-productivity-paradigm', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.prose-terminal .mermaid[data-blog-mermaid-complete="true"]')).toHaveCount(4);

  await page.locator('a[href="/posts/codex-security-vertical-agent-customization"]').last().click();
  await expect(page).toHaveURL(/\/posts\/codex-security-vertical-agent-customization\/?$/);
  await expect(page.locator('.prose-terminal .mermaid[data-blog-mermaid-complete="true"]')).toHaveCount(4);
  await expect(page.locator('.prose-terminal .mermaid').first().locator(':scope > svg')).toBeVisible();
});
