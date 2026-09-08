# Report: B03 render overflow

Status: review (root visual accepted; full geometry pending)
Owner: /root/blog
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09T04:04:00+0800
Contract: `/tmp/vault-pipeline-20260909/blog-render-fix-v8.json` (`246a30774a7169288fa726d3c1be891c00eb4bb92d04c1be3ef0e9af597d72be`)

## Changes

- Reproduced the real ROG page before changing source. The document width looked nominal because the shell hid overflow, but the desktop middle panel had `scrollLeft: 210` after terminal autofocus and the expanded 390px terminal row had 676px intrinsic overflow. That shifted and cropped the whole article column.
- Split the terminal prompt into fixed prefix/suffix and a locally ellipsized path, retained the full path in `title`, gave the command input a responsive fixed width, used `focus({ preventScroll: true })`, wrapped long terminal output tokens, and propagated `min-w-0` through the shell/content wrappers.
- Fixed the duplicate Sidebar script declaration caused by rendering desktop and mobile sidebars together. Both inputs now bind once through data selectors and share one lifecycle listener.
- Applied the approved responsive column behavior to all ten posts/categories/tags index, slug and pagination templates. Permissions/owner remain on desktop and hide on mobile; date/item values remain visible and single-line.
- Reproduced the real Mermaid race on the frozen 4325 and 4326 candidates. Root's full-page audit observed AI diagram widths of 10730/3046/6558px and blank 698px viewports. The original initializer could render the same blocks concurrently, and the first fix was still incomplete because its test did not use the audit's reduced-motion context.
- The article initializer now claims Mermaid source blocks synchronously, serializes concurrent lifecycle calls, queues one follow-up for an Astro navigation that arrives during a render, renders only the claimed nodes, awaits `mermaid.run()` plus two animation frames, and then marks the containers complete.
- Mermaid sizing now runs only for explicitly completed containers, and the renderer waits for `document.fonts.ready`. In reduced-motion mode Mermaid and its descendants use `animation: none` and `transition: none`; this prevents the global `0.01ms` transition rule from introducing SVG layout transitions. Wide diagrams use their stable viewBox width inside their own horizontal scroller, while narrow diagrams retain their natural dimensions.
- Added browser regression coverage for the ROG pane, Sidebar search, ten listing templates/routes, all five real Mermaid-source articles at mobile/desktop with three concurrent cold loads each, local-scroll end reachability, and Mermaid reinitialization across Astro article navigation.

Implementation paths are limited to the v8 contract: terminal/shell components, `ShellLayout`, global styles, `src/pages/posts/[id].astro`, the ten approved listing templates, four rendering E2E specs, and this B03 report/handoff.

## Verification

Pre-fix evidence:

- `/tmp/vault-pipeline-20260909/render-fix/before-desktop.png`
- `/tmp/vault-pipeline-20260909/render-fix/before-mobile.png`
- `/tmp/vault-pipeline-20260909/render-fix/before-geometry.json`
- `/tmp/vault-pipeline-20260909/visual-audit/baseline/offline-v2/276-1440-top.png`
- RED command against the real 4322 ROG route: `E2E_OVERFLOW_POST_URL=... pnpm exec playwright test tests/e2e/render-overflow.spec.ts --config /tmp/vault-pipeline-20260909/render-fix/playwright.baseline.config.ts` — two expected failures, desktop panel scroll 210px and mobile terminal overflow 676px.
- Superseded Mermaid failure evidence: `/tmp/vault-pipeline-20260909/visual-audit/final-light-v2/031-390-5.png`, `/tmp/vault-pipeline-20260909/visual-audit/final-light-v2/031-390-16.png`, and `031-390.json` against 4325.
- Exact 4326 root-runner reproduction: `/tmp/vault-pipeline-20260909/render-fix/root-runner-reproduction.json` — `reducedMotion: reduce`, light, network-idle, fonts ready and full preload produced 44083px content height and 10730/3046/6558/2146px Mermaid scrollers. Computed font size remained 16px/24px, while the universal reduced-motion rule changed SVG transition duration from `0s` to `0.01ms`.

Frozen corrected candidate:

- Output: `/tmp/vault-pipeline-20260909/render-fix/site-b03-v4/dist`
- Server: `http://127.0.0.1:4327` (exec session 29796)
- Build: `CONTENT_DIR=/Users/chlorinec/Documents/main-vault/20-writing/published pnpm build:content` in the isolated copy — 53 articles (50 `published`, 3 `publish`), 103 rendered pages, Pagefind indexed 53 pages; log `/tmp/vault-pipeline-20260909/render-fix/v4-build.log`. This snapshot includes root's verified immutable replacement for the removed Commitizen GIF.
- Exact audit-condition GREEN: `/tmp/vault-pipeline-20260909/render-fix/root-runner-reproduction-v4.json`. AI mobile content height is 18438px and the four diagrams are 1011/439/842/304px after full preload.
- All-Mermaid exact audit-condition evidence: `/tmp/vault-pipeline-20260909/render-fix/root-runner-geometry-v4-all.json` covers five routes at 1440/390 with reduced motion, light mode, network-idle, fonts ready and full preload. All responses are 200; page errors and broken images are empty; transitions are `0s`; labels are 24–48px; local scroll ends are reachable.
- Root Midscene acceptance on 4327: light 14/14 and dark 14/14 completed across 788 screenshots (raw light 11 pass/3 fail; dark 12 pass/2 fail). Root accepted the visual result after reviewing the five raw model failures as three title-wrap false positives and two intentional locally scrollable historical code blocks.
- Exact candidate scope proof: `/tmp/vault-pipeline-20260909/render-fix/4325-4326-4327-v4-scope-proof.json`. After runtime scripts and hashed asset URLs are normalized, all 103 actual bodies are identical from 4325 to 4326; the only 4326/4325 to 4327 body change is root's verified Commitizen GIF URL on `/posts/monorepo`. Eight redirect artifacts reflect root's separate Chinese-slug alias corrections. B03 runtime source changes are limited to the completion-gated Mermaid layout/initializer and reduced-motion/font stabilization.

Commands and results:

- `E2E_REAL_CORPUS=1 E2E_OVERFLOW_POST_URL=http://127.0.0.1:4327/... E2E_MERMAID_FIXTURE_SLUG=ai-productivity-paradigm E2E_REAL_LISTINGS=1 pnpm exec playwright test tests/e2e/render-overflow.spec.ts tests/e2e/sidebar-search.spec.ts tests/e2e/mermaid-reading.spec.ts tests/e2e/listing-responsive.spec.ts --config /tmp/vault-pipeline-20260909/render-fix/playwright.v4.config.ts` — 19 passed. Real Mermaid cases use reduced motion, light mode, network-idle, fonts ready, all five source routes, two viewports and three concurrent cold loads.
- Standard offline fixture gate in `/tmp/vault-pipeline-20260909/render-fix/site-b03-ci`: `pnpm build` passed (log `ci-fixture-build.log`), then the complete E2E inventory passed with 15 passed, 11 explicitly skipped real-corpus cases and 0 failures. Real routes/navigation require `E2E_REAL_CORPUS=1`; the synthetic wide Mermaid, terminal overflow, Sidebar, listing, cutover/history/search/Giscus and mobile checks remain in the default fixture run. The local command used `/tmp/vault-pipeline-20260909/render-fix/playwright.ci-fixture.config.ts` only to select the installed Chrome channel; CI can use its installed Playwright browser through the repository config.
- `pnpm test` — 9 files, 112 tests passed.
- `CONTENT_DIR=/Users/chlorinec/Documents/main-vault/20-writing/published pnpm check` — 53 articles validated; Astro 74 files, 0 errors/warnings/hints. Three existing unresolved-wikilink content warnings remain warnings.
- `git diff --check` — passed.

Execution incident: the first attempt to create the v8 isolated build used the worktree as the command cwd and rebuilt shared `dist` once through `build:content`; it also regenerated `public/_redirects` from the current root-owned mapping. It did not alter the frozen audit candidates, vault content, credentials, Git remote, or deployment state. Root acknowledged the local build and will restore the accepted 4322 preview by running the final consolidated `CONTENT_DIR=... pnpm build:content`, stopping its old 4322 server, then starting `PORT=4322 pnpm preview:e2e`. All subsequent build and review work used isolated candidate directories.

## Remaining integration

- Root accepted the independent 4327 light/dark Midscene sweep. The final 206-viewport geometry sweep is still running and is the only remaining B03 acceptance condition. Keep port 4327 and its output immutable until root finishes.
- Root owns registry/OpenSpec acceptance and the final consolidated local release artifact. B03 performed no Git push, merge, deploy, credential operation, source article edit, taxonomy change, or fallback category.
- The literal historical `【图坏了】` text and intentional inner code/table/image scrolling remain unchanged.


Root final acceptance: corrected4327 geometry sweep completed206/206 PASS with0failures at2026-09-08T20:08:53Z. AllB03 conditions satisfied, locks released andOpenSpec archived. Reports are frozen forcommit; no outstandingrenderinggate.
