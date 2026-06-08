# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home.spec.ts >> Home Page >> page has visible terminal UI elements
- Location: tests/e2e/home.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1')
Expected: visible
Error: strict mode violation: locator('h1') resolved to 2 elements:
    1) <h1 data-astro-source-loc="24:87" class="font-pixel text-xl text-gray-900 dark:text-white mb-1 text-glow-white" data-astro-source-file="/workspace/term-style-blog-r6/src/components/shell/Sidebar.astro">GUEST_USER</h1> aka getByRole('heading', { name: 'GUEST_USER' })
    2) <h1 data-astro-source-loc="20:86" data-astro-source-file="/workspace/term-style-blog-r6/src/pages/index.astro" class="text-4xl font-pixel text-gray-900 dark:text-white mb-4 text-glow-white">SYSTEM ONLINE</h1> aka getByRole('heading', { name: 'SYSTEM ONLINE' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1')

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
          - generic [ref=e50]: guest@server:~
        - generic [ref=e53]:
          - button "Toggle Accessibility Mode" [ref=e54] [cursor=pointer]:
            - img [ref=e55]
          - button "Toggle Theme" [ref=e61] [cursor=pointer]:
            - img [ref=e62]
            - generic [ref=e68]: Toggle Theme
      - generic [ref=e76]:
        - paragraph [ref=e77]: $ ./welcome.sh
        - heading "SYSTEM ONLINE" [level=1] [ref=e78]
        - paragraph [ref=e79]: Welcome to my personal server.
        - paragraph [ref=e80]: Type 'help' or click around to navigate.
        - generic [ref=e83]:
          - generic [ref=e84]: ",.=:!!t3Z3z., :tt:::tt333EE3 Et:::ztt33EEEL @Ee., .., ;tt:::tt333EE7 ;EEEEEEttttt33# :Et:::zt333EEQ. $EEEEEttttt33QL it::::tt333EEF @EEEEEEttttt33F ;3=*^```\"*4EEV :EEEEEEttttt33@. ,.=::::!t=., ` @EEEEEEtttz33QF ;::::::::zt33) \"4EEEtttji3P* :t::::::::tt33.:Z3z.. `` ,..g. i::::::::zt33F AEEEtttt::::ztF ;:::::::::t33V ;EEEttttt::::t3 E::::::::zt33L @EEEtttt::::z3F {3=*^```\"*4E3) ;EEEtttt:::::tZ` ` :EEEEtttt::::z7 \"VEzjt:;;z>*`"
          - generic [ref=e85]:
            - generic [ref=e86]:
              - generic [ref=e87]: "OS:"
              - generic [ref=e88]: Windows
            - generic [ref=e89]:
              - generic [ref=e90]: "Browser:"
              - generic [ref=e91]: Chrome 148.0.7778.96
            - generic [ref=e92]:
              - generic [ref=e93]: "Uptime:"
              - generic [ref=e94]: 0m
            - generic [ref=e95]:
              - generic [ref=e96]: "Screen:"
              - generic [ref=e97]: 1280x720
            - generic [ref=e98]:
              - generic [ref=e99]: "Memory:"
              - generic [ref=e100]: 4 GB
            - generic [ref=e101]:
              - generic [ref=e102]: "Cores:"
              - generic [ref=e103]: "2"
      - generic [ref=e106]:
        - generic [ref=e108]: Type "help" to see available commands.
        - generic [ref=e109]:
          - generic [ref=e110]: guest@server:~ $
          - textbox "Terminal command input" [active] [ref=e111]
  - generic [ref=e115]:
    - button "Menu" [ref=e116]:
      - img [ref=e118]
      - generic: Menu
    - button "Inspect" [ref=e122]:
      - img [ref=e124]
      - generic: Inspect
    - button "Audit" [ref=e126]:
      - img [ref=e128]
      - generic: Audit
    - button "Settings" [ref=e131]:
      - img [ref=e133]
      - generic: Settings
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Home Page', () => {
  4  |   test('home page loads successfully', async ({ page }) => {
  5  |     const response = await page.goto('/');
  6  |     expect(response?.status()).toBe(200);
  7  |   });
  8  | 
  9  |   test('page has visible terminal UI elements', async ({ page }) => {
  10 |     await page.goto('/');
  11 |     // Check for system online heading
  12 |     const heading = page.locator('h1');
> 13 |     await expect(heading).toBeVisible();
     |                           ^ Error: expect(locator).toBeVisible() failed
  14 |   });
  15 | 
  16 |   test('navigation to posts section works', async ({ page }) => {
  17 |     await page.goto('/');
  18 |     // Click on posts link in sidebar or find posts navigation
  19 |     const postsLink = page.locator('a[href="/posts"]').first();
  20 |     await postsLink.click();
  21 |     await expect(page).toHaveURL(/\/posts/);
  22 |   });
  23 | });
```