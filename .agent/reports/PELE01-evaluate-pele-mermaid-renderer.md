# Report: PELE01 evaluate Pele Mermaid renderer

Status: review

Branch: `codex/evaluate-pele-mermaid`, based on `main` `7577a11e1a35535def2d082b65217fdac5982e2a`.

## Result

Pele is a worthwhile renderer for the site's common diagrams, but not a safe full replacement for Mermaid. The implementation routes ordinary diagrams to `pele@1.6.0`, retains Mermaid as an on-demand compatibility fallback for Mermaid init directives, HTML labels, callback click syntax, and Pele failures, and destroys Pele mounts across Astro navigation. This achieves an observed per-article diagram payload reduction without changing the build-time Markdown architecture.

Five fresh local Chromium contexts at 390 × 844 measured four real published Chinese flowcharts. Baseline chart-page JS: 1,020,129 raw / 282,461 gzip bytes across 38 files; baseline no-chart control: 232,158 / 75,870 across 11. Candidate chart-page: 366,757 / 128,512 across 23; candidate control: 233,292 / 76,370 across 11. Same-revision incremental savings: 654,506 raw (83.06%) and 154,449 gzip (74.76%). The chart-ready median moved from 602.987 ms to 579.231 ms, but the sample is small and timing is noisy; no general latency claim is made. Warm build medians were 2.236 s baseline and 2.225 s candidate, effectively unchanged. Total emitted JS grows by 681,449 raw bytes because both renderers remain bundled.

Full measurement versions, method, raw repeated observations, compatibility matrix, constraints, and reproduction steps are in `docs/pele-mermaid-migration-benchmark.md` and should also be summarized in the PR description.

## Files changed

- `package.json`, `pnpm-lock.yaml`
- `src/pages/posts/[id].astro`, `src/styles/global.css`
- `src/test/pele-compatibility.test.ts`
- `tests/e2e/pele-mermaid.spec.ts`
- `tests/fixtures/mermaid/real-blog-flowcharts.json`
- `docs/pele-mermaid-migration-benchmark.md`
- `.agent/tasks.yaml`, this report, handoff, and supervisor handoff

## Tests and commands

- `pnpm test`: pass, 10 files / 124 tests.
- `pnpm test:deployment`: pass, 53 tests.
- `pnpm check`: pass, 0 errors / 0 warnings / 31 pre-existing deprecation hints.
- `pnpm build`: pass; Astro emitted the existing missing `src/icons` warning and a large-chunk warning while retaining Mermaid fallback; Pagefind indexed 5 fixture pages.
- `pnpm test:e2e`: pass, 33 passed / 12 skipped. Skips include tests requiring the explicit external publication corpus; new Pele E2E covers actual extracted chart fixtures, mobile/desktop dimensions, light/dark theme variables, links, dangerous URL rejection, and Mermaid fallback.
- `git diff --check`: pass.

Browser verification used local headless Playwright 1.63 / bundled Chromium revision 1243. The user's interactive Mac browser was locked and was not used.

## OpenSpec impact

No OpenSpec change is proposed. `blog-post-pages` and `typography-rendering` were read before implementation. The Markdown input remains Mermaid syntax and is still progressively enhanced in the client; Mermaid remains available for unsupported content. This bounded change does not alter static build-time rendering or content models.

## Risks and rollback

- Pele is not API- or pixel-equivalent to Mermaid. The measured LR charts adapt into vertical/mobile layouts; unsupported directives, callback interactions, and HTML labels use Mermaid fallback. Other syntax may differ or fall back only after a parse/render failure.
- Pele reports for sequence overlap, long tokens, subgraph crossings, disconnected classes, C4 detection, and code-font behavior remain upstream reports unless covered by our examples; they were not all reproduced.
- The large generated JS total and chunk warning remain because compatibility fallback ships with Mermaid. Remove the Pele runtime/style/tests and restore the previous Mermaid renderer in `[id].astro` to roll back this proposal.
- The content source in `main` contains only demo articles, so measurements inject the exact four source blocks from the public blog page into a local production build. CDN Brotli/cache effects are not represented.

## Follow-up

Draft PR creation and remote CI terminal results are pending. No merge, deployment, credential change, or PR #28 modification occurred.
