# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> Accessibility Smoke Tests >> about page has no critical axe violations
- Location: tests/e2e/a11y.spec.ts:23:3

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 0
Received length: 2
Received array:  [{"description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds", "help": "Elements must meet minimum color contrast ratio thresholds", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright", "id": "color-contrast", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"bgColor": "#111111", "contrastRatio": 3.45, "expectedContrastRatio": "4.5:1", "fgColor": "#155bf5", "fontSize": "7.5pt (10px)", "fontWeight": "bold", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 3.45 (foreground color: #155bf5, background color: #111111, font size: 7.5pt (10px), font weight: bold). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"pixel-panel p-4 flex flex-col items-center text-center\">", "target": [".text-center.pixel-panel.p-4"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 3.45 (foreground color: #155bf5, background color: #111111, font size: 7.5pt (10px), font weight: bold). Expected contrast ratio of 4.5:1", "html": "<pre class=\"text-[10px] leading-none mb-4 text-blue-600 dark:text-green-500 font-bold\"> _____·
/     \\
| () () |
\\  ^  /·
 |||||··
 |||||···
    </pre>", "impact": "serious", "none": [], "target": [".text-\\[10px\\]"]}, {"all": [], "any": [{"data": {"bgColor": "#111111", "contrastRatio": 1.06, "expectedContrastRatio": "4.5:1", "fgColor": "#101827", "fontSize": "15.0pt (20px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 1.06 (foreground color: #101827, background color: #111111, font size: 15.0pt (20px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"pixel-panel p-4 flex flex-col items-center text-center\">", "target": [".text-center.pixel-panel.p-4"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 1.06 (foreground color: #101827, background color: #111111, font size: 15.0pt (20px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<h1 class=\"font-pixel text-xl text-gray-900 dark:text-white mb-1 text-glow-white\">GUEST_USER</h1>", "impact": "serious", "none": [], "target": [".text-glow-white"]}, {"all": [], "any": [{"data": {"bgColor": "#111111", "contrastRatio": 3.45, "expectedContrastRatio": "4.5:1", "fgColor": "#155bf5", "fontSize": "10.5pt (14px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 3.45 (foreground color: #155bf5, background color: #111111, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"pixel-panel p-4 flex flex-col items-center text-center\">", "target": [".text-center.pixel-panel.p-4"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 3.45 (foreground color: #155bf5, background color: #111111, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<p class=\"text-sm text-blue-600 dark:text-green-600 mb-4\">Level 42 Developer</p>", "impact": "serious", "none": [], "target": [".dark\\:text-green-600"]}, {"all": [], "any": [{"data": {"bgColor": "#111111", "contrastRatio": 3.73, "expectedContrastRatio": "4.5:1", "fgColor": "#676f7f", "fontSize": "10.5pt (14px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 3.73 (foreground color: #676f7f, background color: #111111, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"pixel-panel p-4 flex flex-col gap-3\">", "target": [".pixel-panel.p-4.gap-3:nth-child(2)"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 3.73 (foreground color: #676f7f, background color: #111111, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<h2 class=\"font-pixel text-sm text-gray-500 mb-1\">NETWORK</h2>", "impact": "serious", "none": [], "target": [".pixel-panel.p-4.gap-3:nth-child(2) > .mb-1"]}, {"all": [], "any": [{"data": {"bgColor": "#111111", "contrastRatio": 3.73, "expectedContrastRatio": "4.5:1", "fgColor": "#676f7f", "fontSize": "10.5pt (14px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 3.73 (foreground color: #676f7f, background color: #111111, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"pixel-panel p-4 flex flex-col gap-3\">", "target": [".pixel-panel.p-4.gap-3:nth-child(3)"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 3.73 (foreground color: #676f7f, background color: #111111, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<h2 class=\"font-pixel text-sm text-gray-500 mb-1\">SEARCH</h2>", "impact": "serious", "none": [], "target": [".pixel-panel.p-4.gap-3:nth-child(3) > .mb-1"]}, {"all": [], "any": [{"data": {"bgColor": "#0a0a0a", "contrastRatio": 3.77, "expectedContrastRatio": "4.5:1", "fgColor": "#155dfc", "fontSize": "12.0pt (16px)", "fontWeight": "normal", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 3.77 (foreground color: #155dfc, background color: #0a0a0a, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<div class=\"flex-1 pixel-panel flex flex-col overflow-hidden bg-white dark:bg-[#020202]\">", "target": [".dark\\:bg-\\[\\#020202\\]"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 3.77 (foreground color: #155dfc, background color: #0a0a0a, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1", "html": "<p class=\"text-blue-600 dark:text-green-400 mb-6\">$ cat ~/about.txt</p>", "impact": "serious", "none": [], "target": [".mb-6.dark\\:text-green-400"]}], "tags": ["cat.color", "wcag2aa", "wcag143", "TTv5", "TT13.c", "EN-301-549", "EN-9.1.4.3", "ACT", "RGAAv4", "RGAA-3.2.1"]}, {"description": "Ensure elements that have scrollable content are accessible by keyboard in Safari", "help": "Scrollable region must have keyboard access", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/scrollable-region-focusable?application=playwright", "id": "scrollable-region-focusable", "impact": "serious", "nodes": [{"all": [], "any": [{"data": null, "id": "focusable-content", "impact": "serious", "message": "Element should have focusable content", "relatedNodes": []}, {"data": null, "id": "focusable-element", "impact": "serious", "message": "Element should be focusable", "relatedNodes": []}], "failureSummary": "Fix any of the following:
  Element should have focusable content
  Element should be focusable", "html": "<div id=\"content-scroll\" class=\"flex-1 p-4 md:p-6 overflow-y-auto flex flex-col\">", "impact": "serious", "none": [], "target": ["#content-scroll"]}], "tags": ["cat.keyboard", "wcag2a", "wcag211", "wcag213", "TTv5", "TT4.a", "EN-301-549", "EN-9.2.1.1", "EN-9.2.1.3", "RGAAv4", …]}]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: _____ / \ | () () | \ ^ / ||||| |||||
        - heading "GUEST_USER" [level=1] [ref=e8]
        - paragraph [ref=e9]: Level 42 Developer
        - generic [ref=e11]:
          - link "~/home" [ref=e12] [cursor=pointer]:
            - /url: /
            - img [ref=e13]
            - text: ~/home
          - link "~/posts" [ref=e15] [cursor=pointer]:
            - /url: /posts
            - img [ref=e16]
            - text: ~/posts
          - link "~/categories" [ref=e18] [cursor=pointer]:
            - /url: /categories
            - img [ref=e19]
            - text: ~/categories
          - link "~/tags" [ref=e21] [cursor=pointer]:
            - /url: /tags
            - img [ref=e22]
            - text: ~/tags
          - link "~/about" [ref=e24] [cursor=pointer]:
            - /url: /about
            - img [ref=e25]
            - text: ~/about
      - generic [ref=e27]:
        - heading "NETWORK" [level=2] [ref=e28]
        - link "github" [ref=e29] [cursor=pointer]:
          - /url: https://github.com/
          - img [ref=e30]
          - text: github
        - link "twitter" [ref=e32] [cursor=pointer]:
          - /url: https://twitter.com/
          - img [ref=e33]
          - text: twitter
        - link "email" [ref=e35] [cursor=pointer]:
          - /url: mailto:hello@example.com
          - img [ref=e36]
          - text: email
      - generic [ref=e38]:
        - heading "SEARCH" [level=2] [ref=e39]
        - generic [ref=e40]:
          - generic [ref=e41]: $ grep
          - textbox "Grep search input" [ref=e42]:
            - /placeholder: hello
      - generic [ref=e43]:
        - text: SYS.VER 1.0.4
        - text: © 2026
    - generic [ref=e44]:
      - generic [ref=e46]:
        - generic [ref=e47]:
          - img [ref=e48]
          - generic [ref=e50]: guest@server:~/about
        - generic [ref=e53]:
          - button "Toggle Accessibility Mode" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
          - button "Toggle Theme" [ref=e61] [cursor=pointer]:
            - img [ref=e62]
            - generic [ref=e68]: Toggle Theme
      - generic [ref=e76]:
        - paragraph [ref=e77]: $ cat ~/about.txt
        - generic [ref=e78]:
          - generic [ref=e80]: "_.-'''''-._ .' _ _ '. / (o) (o) \\ | | | \\ / | \\ '. .' / '. `'---'` .' '-._____.-'"
          - generic [ref=e81]:
            - heading "ABOUT_ME" [level=2] [ref=e82]
            - paragraph [ref=e83]: Hi, I'm a developer who loves retro aesthetics, pixel art, and building things from scratch.
            - paragraph [ref=e84]: I specialize in creating web experiences that don't just look like standard corporate templates. I believe the web should be fun, weird, and personal.
            - generic [ref=e85]:
              - heading "SKILLS" [level=3] [ref=e86]
              - generic [ref=e87]:
                - generic [ref=e88]: React
                - generic [ref=e89]: TypeScript
                - generic [ref=e90]: Rust
                - generic [ref=e91]: TailwindCSS
                - generic [ref=e92]: Pixel Art
                - generic [ref=e93]: Linux
      - generic [ref=e96]:
        - generic [ref=e98]: Type "help" to see available commands.
        - generic [ref=e99]:
          - generic [ref=e100]: guest@server:~/about $
          - textbox "Terminal command input" [active] [ref=e101]
  - generic [ref=e105]:
    - button "Menu" [ref=e106]:
      - img [ref=e108]
      - generic: Menu
    - button "Inspect" [ref=e112]:
      - img [ref=e114]
      - generic: Inspect
    - button "Audit" [ref=e116]:
      - img [ref=e118]
      - generic: Audit
    - button "Settings" [ref=e121]:
      - img [ref=e123]
      - generic: Settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | 
  4  | test.describe('Accessibility Smoke Tests', () => {
  5  |   test('home page has no critical axe violations', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     const accessibilityScanResults = await new AxeBuilder({ page })
  8  |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  9  |       .analyze();
  10 |     
  11 |     expect(accessibilityScanResults.violations).toHaveLength(0);
  12 |   });
  13 | 
  14 |   test('posts listing has no critical axe violations', async ({ page }) => {
  15 |     await page.goto('/posts');
  16 |     const accessibilityScanResults = await new AxeBuilder({ page })
  17 |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  18 |       .analyze();
  19 |     
  20 |     expect(accessibilityScanResults.violations).toHaveLength(0);
  21 |   });
  22 | 
  23 |   test('about page has no critical axe violations', async ({ page }) => {
  24 |     await page.goto('/about');
  25 |     const accessibilityScanResults = await new AxeBuilder({ page })
  26 |       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  27 |       .analyze();
  28 |     
> 29 |     expect(accessibilityScanResults.violations).toHaveLength(0);
     |                                                 ^ Error: expect(received).toHaveLength(expected)
  30 |   });
  31 | });
```