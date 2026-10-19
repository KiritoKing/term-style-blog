# Report: SHELL02 resilient-shell-interactivity

Status: pass (implementation, local acceptance, PR, and CI complete; awaiting review)

## Files changed

- `src/layouts/Layout.astro`: inline theme/accessibility initialization, delegated controls, Astro navigation and storage synchronization.
- `src/components/shell/TopBar.astro`: server-rendered buttons replace the React top-bar island.
- `src/components/react/TopBarControls.tsx`: removed.
- `src/layouts/ShellLayout.astro`: one responsive `<details>` wrapper and one terminal island for mobile/desktop.
- `src/components/react/TerminalPanel.tsx`, `src/lib/safe-storage.ts`: best-effort local storage.
- `src/test/safe-storage.test.ts`, `tests/e2e/shell-interactivity.spec.ts`: storage unit and browser regressions.
- `docs/shell-interactivity-benchmark.md`, `docs/shell-interactivity-benchmark-data.json`: paired results and all raw runs.
- `openspec/changes/resilient-shell-interactivity/`: proposal, design, test design, tasks, and spec delta.

## Commands run

- `openspec validate resilient-shell-interactivity --strict` — pass.
- `pnpm check` — pass: 0 errors, 0 warnings, 31 existing hints. Initial sandbox attempt failed because `tsx` could not create a temporary IPC socket; rerun with required local process permission passed.
- `pnpm exec vitest run src/test/safe-storage.test.ts` — pass, 6/6.
- `pnpm test` — pass, 133/133 across 12 files.
- `pnpm test:deployment` — pass, 53/53.
- `E2E_REAL_CORPUS=1 E2E_POST_SLUG=KeePass pnpm test:e2e` — initial run exposed two stale tests selecting removed duplicate terminal nodes. Updated `tests/e2e/render-overflow.spec.ts` for the single responsive terminal; rerun passed, 38 passed / 13 skipped / 0 failed.
- `E2E_REAL_CORPUS=1 E2E_POST_SLUG=KeePass pnpm exec playwright test tests/e2e/render-overflow.spec.ts tests/e2e/shell-interactivity.spec.ts --reporter=line` — pass, 5/5.
- Same-snapshot production builds for baseline main `72eedaff5032e45c50d6a860c5d81b725abc400d` and candidate — pass, each 55 articles / 9,911 indexed words.
- Paired browser measurement: 5 fresh contexts each for home and the real four-chart article, per variant; exact versions/method/raw data are in the benchmark files. The local preview measurements show a roughly 2–3% reduction in page script transfer and fewer islands (4 to 2), but no defensible user-visible click-response speed gain.
- `git diff --check` — pass.
- `openspec validate shell-layout --type spec --strict` — pass after syncing the shell-layout spec.
- `openspec archive resilient-shell-interactivity --yes --skip-specs` — pass after manual spec sync and validation; archive at `openspec/changes/archive/2026-10-19-resilient-shell-interactivity/`.
- Commit `ed5ddaaa27d724d0a26e8b2eb174e00b6e6972bf` pushed as `perf/early-interactivity-resilience`.
- PR [#36](https://github.com/KiritoKing/term-style-blog/pull/36) opened with measurement table, reproduction notes, raw-data links, compatibility risks, and rollback instructions. `verify`, three CodeQL analyses, and CodeQL all reached terminal success.

## Result and risks

The change has the expected architecture and all local unit, deployment, Astro, and full E2E gates pass. Initial E2E failures came from stale selectors for the duplicate terminal structure and are fixed in a regression test. OpenSpec is synced and archived. TDD sequencing was not fully met: tests were added after the first implementation rather than run red before the code change; the change has not been widened beyond its approved scope.

The local benchmark is not a production network benchmark. It ran through Astro preview on localhost and did not model Cloudflare compression, CPU throttling, or remote latency. Script transfer/decoded data and timing limitations are documented alongside the raw samples.

## Follow-ups

1. Await supervisor/owner review of PR #36.
2. Keep it unmerged and do not deploy unless the controlling user instruction explicitly authorizes those actions.
