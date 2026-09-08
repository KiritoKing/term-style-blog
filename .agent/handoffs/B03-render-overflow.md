# Handoff: B03 render overflow

Status: review (root visual accepted; full geometry pending)
Owner: /root/blog
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09T04:04:00+0800

Objective: repair the real ROG long-path crop and verified shared render defects while preserving the terminal shell, article data, interactions, and desktop behavior.

Relevant specs: `openspec/changes/blog-visual-metadata-gates/**`, `openspec/specs/shell-layout/spec.md`, `openspec/specs/typography-rendering/spec.md`, `openspec/specs/mobile-reading-experience/spec.md`.

## Completed

- Reproduced and fixed the ROG desktop pane shift and mobile terminal overflow.
- Fixed duplicate Sidebar initialization and verified desktop/mobile search.
- Made all ten approved listing templates hide only secondary mobile columns while keeping dates/items unbroken.
- Reproduced the 4325/4326 real Mermaid blank-space regression, traced the remaining failure to the universal reduced-motion transition duration, disabled Mermaid transitions/animations under that preference, and verified every real Mermaid-source article under repeated concurrent cold loads, exact root preload conditions, and Astro navigation.
- Passed 19 B03 browser checks, 112 unit tests, real 53-article content validation, Astro check with 0 diagnostics, isolated content build with Pagefind, and diff check.

## In progress

Root accepted the 4327 light/dark Midscene sweep (14/14 each, 788 screenshots) and is running the final 206-viewport geometry sweep.

## Blocked by

No B03 implementation blocker.

## Next actions

1. Root records the 4327 full-sweep result and reviews the B03 report/diff.
2. Root accepts/archives B03 through the existing `blog-visual-metadata-gates` registry/OpenSpec flow.
3. Root refreshes the shared local preview/release artifact after acceptance; no remote deployment is part of B03.

## Frozen review target

- Output: `/tmp/vault-pipeline-20260909/render-fix/site-b03-v4/dist`
- Server: `http://127.0.0.1:4327` (exec session 29796)
- Build log: `/tmp/vault-pipeline-20260909/render-fix/v4-build.log`
- Exact root-runner RED/GREEN: `/tmp/vault-pipeline-20260909/render-fix/root-runner-reproduction.json`, `/tmp/vault-pipeline-20260909/render-fix/root-runner-reproduction-v4.json`
- All-Mermaid geometry: `/tmp/vault-pipeline-20260909/render-fix/root-runner-geometry-v4-all.json`
- Candidate scope proof: `/tmp/vault-pipeline-20260909/render-fix/4325-4326-4327-v4-scope-proof.json`
- Screenshots and before/after artifacts: `/tmp/vault-pipeline-20260909/render-fix/`

## Commands and results

- RED real ROG spec on 4322: 2 expected failures (210px pane shift; 676px mobile row overflow).
- Corrected B03 E2E on 4327: 19 passed, including reduced-motion real Mermaid conditions.
- Isolated standard fixture `pnpm build`: passed; complete default E2E inventory: 15 passed, 11 explicit real-corpus skips, 0 failures. Real corpus cases require `E2E_REAL_CORPUS=1`; synthetic regression coverage stays enabled by default.
- Isolated real `build:content`: 53 articles, 103 pages, Pagefind 53 pages.
- `pnpm check`: 74 Astro files, 0 diagnostics.
- `pnpm test`: 112 passed.
- `git diff --check`: passed.

## Risks and open questions

- Root's final full corrected 4327 geometry sweep is pending; Midscene is accepted.
- Three unresolved wikilinks remain existing validator warnings outside B03.
- The first v8 build command rebuilt shared local `dist` once by cwd mistake; root acknowledged it. Frozen 4325 evidence and corrected 4326 candidate were unaffected, and no external state changed.


Root final acceptance: corrected4327 geometry sweep completed206/206 PASS with0failures at2026-09-08T20:08:53Z. AllB03 conditions satisfied, locks released andOpenSpec archived. Reports are frozen forcommit; no outstandingrenderinggate.
