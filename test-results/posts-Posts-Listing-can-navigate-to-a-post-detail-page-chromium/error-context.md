# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: posts.spec.ts >> Posts Listing >> can navigate to a post detail page
- Location: tests/e2e/posts.spec.ts:16:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a[href^="/posts/"]').first()

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
          - generic [ref=e50]: guest@server:~/posts
        - generic [ref=e53]:
          - button "Toggle Accessibility Mode" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
          - button "Toggle Theme" [ref=e61] [cursor=pointer]:
            - img [ref=e62]
            - generic [ref=e68]: Toggle Theme
      - generic [ref=e76]:
        - paragraph [ref=e77]: $ ls -la ~/posts
        - generic [ref=e79]:
          - generic [ref=e80]: PERMISSIONS
          - generic [ref=e81]: OWNER
          - generic [ref=e82]: DATE
          - generic [ref=e83]: NAME
      - generic [ref=e86]:
        - generic [ref=e88]: Type "help" to see available commands.
        - generic [ref=e89]:
          - generic [ref=e90]: guest@server:~/posts $
          - textbox "Terminal command input" [active] [ref=e91]
  - generic [ref=e95]:
    - button "Menu" [ref=e96]:
      - img [ref=e98]
      - generic: Menu
    - button "Inspect" [ref=e102]:
      - img [ref=e104]
      - generic: Inspect
    - button "Audit" [ref=e106]:
      - img [ref=e108]
      - generic: Audit
    - button "Settings" [ref=e111]:
      - img [ref=e113]
      - generic: Settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Posts Listing', () => {
  4  |   test('posts listing page loads', async ({ page }) => {
  5  |     const response = await page.goto('/posts');
  6  |     expect(response?.status()).toBe(200);
  7  |   });
  8  | 
  9  |   test('post links are visible and clickable', async ({ page }) => {
  10 |     await page.goto('/posts');
  11 |     // Find at least one post link
  12 |     const postLink = page.locator('a[href^="/posts/"]').first();
  13 |     await expect(postLink).toBeVisible();
  14 |   });
  15 | 
  16 |   test('can navigate to a post detail page', async ({ page }) => {
  17 |     await page.goto('/posts');
  18 |     const postLink = page.locator('a[href^="/posts/"]').first();
> 19 |     await postLink.click();
     |                    ^ Error: locator.click: Test timeout of 30000ms exceeded.
  20 |     // Should navigate to a specific post
  21 |     await expect(page).toHaveURL(/\/posts\/[^/]+/);
  22 |   });
  23 | });
```