# Report: PELE01 evaluate Pele Mermaid renderer

Status: review

Branch: `codex/evaluate-pele-mermaid`, based on `main` `7577a11e1a35535def2d082b65217fdac5982e2a`.

## Result

The owner explicitly chose a Pele-only migration and accepted Mermaid compatibility loss. The branch removes Mermaid runtime dependency; no Mermaid engine, dual-renderer fallback, or callback detector remains. Diagram enhancement stays client-side and lazy, preserving the existing static Markdown/build architecture.

Five fresh local headless Chromium contexts at 390 × 844 measured four real published Chinese flowcharts. Baseline chart page JS was 1,020,129 raw / 282,461 gzip bytes across 38 files; no-chart control was 232,158 / 75,870 across 11. Pele chart page was 365,875 / 127,855 across 22; no-chart control was 232,410 / 75,713 across 10. Incremental payload fell from 787,971 / 206,591 to 133,465 / 52,142 bytes: 83.06% raw and 74.76% gzip savings over each revision's control. The chart-page absolute reduction was 654,254 raw / 154,606 gzip bytes. Chart enhancement medians were 167.1 ms baseline and 64.6 ms Pele (102.5 ms / 61.3% lower). Five runs on one local browser are directional only.

Five clean production builds had medians 2.157445 s baseline and 2.004571 s Pele, with one 2.587 s candidate outlier. Emitted JS was 3,622,010 bytes (107 files) vs 934,339 (66 files), 2,687,671 fewer bytes. Details, per-run values, versions, methods, outputs, limitations, and reproduction commands are in `docs/pele-mermaid-migration-benchmark.md`; reproducible harnesses are `scripts/benchmark-mermaid.mjs` and `scripts/benchmark-build.mjs`.

## Changes

- Removed `mermaid` dependency and lockfile graph.
- Replaced the runtime renderer with `pele/lazy`; retained original fenced source and an accessible error status if import/render fails.
- Added generation-aware async mount cleanup for Astro navigation and lifecycle tests.
- Added representative compatibility, SVG payload, theme, responsive, links, chunk-failure, and delayed-navigation E2E coverage.
- Added same-input browser/build benchmark harnesses and documented raw results.

## Validation

- `pnpm test`: pass, 11 files / 127 tests.
- `pnpm test:deployment`: pass, 53 tests.
- `pnpm check`: pass, 0 errors / 0 warnings / 31 existing hints.
- `pnpm build`: pass; existing missing `src/icons` and Pagefind redirect HTML warnings. Mermaid large-chunk warning is gone.
- `pnpm test:e2e`: pass, 35 passed / 12 skipped (external publication corpus unavailable).
- Latest focused Pele E2E: 4/4 pass, including source preservation when lazy chunk is blocked and delayed completion after two Astro navigations.
- `git diff --check`: pass before commit.

Browser verification used Playwright 1.63 with local headless Chromium `153.0.8010.12`. The user's interactive Mac browser was not used.

## Compatibility and risks

Real article syntax covered four Chinese LR/TD flowcharts; unit samples cover flowchart, sequence, class, state, ER, journey, Gantt, pie, mindmap, and xychart. Mobile charts remain within viewport with readable CJK labels; Pele changes chart geometry and adapts LR diagrams into taller layouts. Unit/E2E samples cover light/dark theme variables, safe external links, `javascript:` URL, and actual `<img onerror>`/`<script>` label input; executable markup was absent from generated SVG in those samples. This does not certify all SVG/security inputs.

Known accepted compatibility losses: Mermaid `init`/theme directives and `themeVariables`, HTML labels, JavaScript callback clicks, Mermaid plugins/extensions, and untested syntax/layout-specific options. Parse/render failures preserve source and show an error status; there is no fallback engine. Restore Mermaid dependency, lockfile, and renderer in `src/pages/posts/[id].astro` to roll back.

## Pull request and CI

Draft PR: https://github.com/KiritoKing/term-style-blog/pull/32

Existing CI success belongs to an earlier PR head (`39214195750`, commit `1346e8b50a834c6c11253d6414a63c2303124e52`). Current pure-Pele head `2a78a03527238d442b973d21f6a87bf64cce300e` was pushed. CI run `39217345586` reached terminal `success`; verify passed install, unit, deployment, Astro check, build, Chromium setup, and full Playwright E2E. PR #28 is untouched. No merge, deployment, credential, or permission changes were made.
