# Test design: resilient shell interactivity

## Unit (Vitest)

- Cover storage read when a value exists, missing value, read throwing `SecurityError`, and writes throwing `QuotaExceededError`.
- Fixture: an in-memory `Storage`-shaped object and deterministic throwing implementations; no network or live content.

## Browser (Playwright)

- Verify theme and accessibility controls work immediately without loading the React runtime, retain their labels/classes and persistence, and remain functional after Astro navigation/back-forward.
- Verify one terminal island exists per page; desktop shows it, mobile collapses it, resize preserves the selected mobile disclosure state, and commands still run/navigation works.
- Inject throwing storage reads and writes; theme, accessibility, terminal commands, and terminal navigation must continue working.
- Run existing real-article Pele success/failure completion and Astro navigation regressions unchanged.
- Fixture: existing Markdown fixture build for deterministic local/E2E validation; performance comparison additionally uses the same immutable published snapshot on baseline and candidate, explicitly not Notion.

## Benchmark

- Use identical content snapshot, Astro build command, browser version, viewport, and page fixture for baseline and candidate. Repeat five fresh browser contexts per page and variant. Measure a real theme-button click after `load` through the resulting `html.dark` class change, resource request transfer/encoded/decoded bytes, island count, page errors, and horizontal overflow. The article sample waits for all four chart SVGs. Preserve raw run JSON. Lifecycle events are contextual only, never the interactivity endpoint.
- This benchmark measures post-load click response, not time-to-first-possible-interaction or warm-cache navigation. Astro preview is local and uncompressed; gzip figures are separately computed estimates. No production CDN, network shaping, or CPU throttling was used.

## OpenSpec and repository checks

- Validate the active change strictly before implementation; after tests pass, sync the delta to `openspec/specs/shell-layout/spec.md`, archive the change, and run strict validation again.
