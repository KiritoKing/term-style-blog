import { expect, test } from '@playwright/test';

const postSlug = process.env.E2E_OVERFLOW_POST_SLUG ?? process.env.E2E_POST_SLUG ?? 'hello-world';
const absolutePostUrl = process.env.E2E_OVERFLOW_POST_URL;
const stressPath =
  '~/posts/rog-ally-xbox-x-%E6%8E%8C%E6%9C%BA%E6%8A%98%E8%85%BE%E8%AE%B0%E5%BD%95';

const viewports = [
  {
    name: 'desktop',
    viewport: { width: 1440, height: 900 },
    inputSelector: 'div.crt-flicker.hidden input[aria-label="Terminal command input"]',
    openMobileTerminal: false,
  },
  {
    name: '390px',
    viewport: { width: 390, height: 844 },
    inputSelector: 'details[data-mobile-terminal] input[aria-label="Terminal command input"]',
    openMobileTerminal: true,
  },
] as const;

for (const testCase of viewports) {
  test(`a long post pathname cannot shift or overflow the terminal content pane at ${testCase.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(testCase.viewport);
    await page.goto(absolutePostUrl ?? `/posts/${postSlug}`);

    if (testCase.openMobileTerminal) {
      await page.locator('details[data-mobile-terminal] > summary').click();
    }

    const input = page.locator(testCase.inputSelector);
    const prompt = input.locator('xpath=preceding-sibling::*[1]');

    await expect(input).toBeAttached();
    await expect(prompt).toBeAttached();

    // This keeps the fixture deterministic when the regular three-post fixture is used.
    // The real ROG route supplies the same kind of percent-encoded pathname without mutation.
    if (!absolutePostUrl) {
      await prompt.evaluate((element, path) => {
        const pathSegment = element.querySelector('span[title]');
        if (!(pathSegment instanceof HTMLElement)) {
          throw new Error('Expected the terminal prompt path segment.');
        }
        pathSegment.textContent = path;
        pathSegment.title = path;
      }, stressPath);
      await input.focus();
    }

    const geometry = await input.evaluate((element) => {
      const terminalRow = element.parentElement;
      const panel = element.closest('.pixel-panel');
      const content = panel?.querySelector<HTMLElement>('#content-scroll');
      const article = content?.querySelector<HTMLElement>('article[data-pagefind-body]');
      const panelRect = panel?.getBoundingClientRect();
      const contentRect = content?.getBoundingClientRect();
      const articleRect = article?.getBoundingClientRect();
      const inputRect = element.getBoundingClientRect();

      if (!terminalRow || !panel || !content || !article || !panelRect || !contentRect || !articleRect) {
        throw new Error('Expected terminal panel geometry was not available.');
      }

      return {
        panelScrollLeft: panel.scrollLeft,
        terminalOverflow: terminalRow.scrollWidth - terminalRow.clientWidth,
        contentLeftDelta: contentRect.left - panelRect.left,
        contentRightDelta: panelRect.right - contentRect.right,
        articleLeftDelta: articleRect.left - contentRect.left,
        inputWidth: inputRect.width,
      };
    });

    expect(geometry.panelScrollLeft).toBeLessThanOrEqual(1);
    expect(geometry.terminalOverflow).toBeLessThanOrEqual(1);
    expect(geometry.contentLeftDelta).toBeGreaterThanOrEqual(-1);
    expect(geometry.contentRightDelta).toBeGreaterThanOrEqual(-1);
    expect(geometry.articleLeftDelta).toBeGreaterThan(0);
    expect(geometry.inputWidth).toBeGreaterThanOrEqual(32);
    await expect(input).toBeVisible();
  });
}
