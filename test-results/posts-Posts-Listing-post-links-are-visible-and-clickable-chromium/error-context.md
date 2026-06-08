# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: posts.spec.ts >> Posts Listing >> post links are visible and clickable
- Location: tests/e2e/posts.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href^="/posts/"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href^="/posts/"]').first()

```

```yaml
- text: _____ / \ | () () | \ ^ / ||||| |||||
- heading "GUEST_USER" [level=1]
- paragraph: Level 42 Developer
- link "~/home":
  - /url: /
- link "~/posts":
  - /url: /posts
- link "~/categories":
  - /url: /categories
- link "~/tags":
  - /url: /tags
- link "~/about":
  - /url: /about
- heading "NETWORK" [level=2]
- link "github":
  - /url: https://github.com/
- link "twitter":
  - /url: https://twitter.com/
- link "email":
  - /url: mailto:hello@example.com
- heading "SEARCH" [level=2]
- text: $ grep
- textbox "Grep search input":
  - /placeholder: hello
- text: SYS.VER 1.0.4 © 2026 guest@server:~/posts
- button "Toggle Accessibility Mode"
- button "Toggle Theme"
- paragraph: $ ls -la ~/posts
- text: PERMISSIONS OWNER DATE NAME Type "help" to see available commands. guest@server:~/posts $
- textbox "Terminal command input"
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
> 13 |     await expect(postLink).toBeVisible();
     |                            ^ Error: expect(locator).toBeVisible() failed
  14 |   });
  15 | 
  16 |   test('can navigate to a post detail page', async ({ page }) => {
  17 |     await page.goto('/posts');
  18 |     const postLink = page.locator('a[href^="/posts/"]').first();
  19 |     await postLink.click();
  20 |     // Should navigate to a specific post
  21 |     await expect(page).toHaveURL(/\/posts\/[^/]+/);
  22 |   });
  23 | });
```