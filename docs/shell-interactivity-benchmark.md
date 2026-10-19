# Shell interactivity benchmark

## Result

The change removes one hydrated island from each page and reduces browser-reported script transfer slightly. These measurements do **not** show a defensible user-visible speedup: home theme response is effectively unchanged, while the article difference is small and within the limits of a local microbenchmark. The strongest supported result is fewer client islands and improved resilience when React or local storage fails.

| Page | Metric | main `72eedaf` | Candidate | Difference |
|---|---:|---:|---:|---:|
| Home | Script transfer (median, browser Resource Timing) | 73,269 B | 71,084 B | −2,185 B (−3.0%) |
| Home | Script decoded (median) | 226,879 B | 221,165 B | −5,714 B (−2.5%) |
| Home | HTML raw / gzip estimate | 64,813 / 9,709 B | 57,165 / 10,391 B | raw −7,648 B; gzip +682 B |
| Home | HTML + JS gzip estimate, gzip level 6 | 84,886 B | 82,988 B | −1,898 B (−2.2%) |
| Home | Theme click → `html.dark` update (median) | 57.10 ms | 56.94 ms | −0.16 ms (noise-level) |
| Home | DOMContentLoaded / load (median) | 21.9 / 22.0 ms | 21.2 / 21.3 ms | −0.7 ms / −0.7 ms |
| Article with 4 real Mermaid charts | Script transfer (median, browser Resource Timing) | 135,634 B | 132,724 B | −2,910 B (−2.1%) |
| Article with 4 real Mermaid charts | Script decoded (median) | 366,141 B | 360,003 B | −6,138 B (−1.7%) |
| Article with 4 real Mermaid charts | HTML raw / gzip estimate | 98,137 / 21,512 B | 90,370 / 22,063 B | raw −7,767 B; gzip +551 B |
| Article with 4 real Mermaid charts | HTML + JS gzip estimate, gzip level 6 | 149,591 B | 147,561 B | −2,030 B (−1.4%) |
| Article with 4 real Mermaid charts | Theme click → `html.dark` update (median) | 39.07 ms | 37.46 ms | −1.61 ms (−4.1%; too small to claim as a reliable gain) |
| Article with 4 real Mermaid charts | DOMContentLoaded / load (median) | 38.8 / 38.9 ms | 38.3 / 38.4 ms | −0.5 ms / −0.5 ms |
| Both pages | Astro islands | 4 (2 TerminalPanel instances) | 2 (1 TerminalPanel instance) | −2 islands; one terminal island instead of two |

All five runs per page are in [`shell-interactivity-benchmark-data.json`](./shell-interactivity-benchmark-data.json). No page/console errors or horizontal overflow occurred in these runs. The article measurement waited for four rendered SVGs before taking the interaction sample.

## Method and reproduction

- Compared main commit `72eedaff5032e45c50d6a860c5d81b725abc400d` with the candidate branch using the same 55-file published Markdown snapshot (`llm-obsidian` snapshot `a4d2069946d8479e551c3bef6965b266dd08ce9a`).
- Versions: Node.js 26.0.0, Astro 7.3.2, Pele 1.6.0, React 19.2.4, Playwright 1.63.0, Chromium 153.0.8010.12.
- Built both outputs with the same strict content command: `CONTENT_DIR=/tmp/llm-published-snapshot/20-writing/published EXPECTED_CONTENT_COUNT=55 PUBLIC_DEPLOYMENT_ENV=preview STRICT_CONTENT_ASSETS=1 pnpm build:content`.
- Served each generated `dist/` with `pnpm exec astro preview --host 127.0.0.1 --port 4322`. Ran headless Playwright Chromium locally at 390×844 CSS pixels. Each of five repetitions per page used a fresh browser context, dark color scheme, and the same `tsb:theme=dark` / `tsb:a11y=0` storage state.
- Measured `/` and the actual four-chart article `/posts/ai-productivity-paradigm` (the site uses `trailingSlash: never`). Recorded navigation timing, browser Resource Timing script bytes, island count, overflow, and page/console errors. Then clicked the theme button and measured until the root `dark` class changed. Article runs waited for all four Pele SVGs.
- Gzip estimates are a separate calculation over the emitted JavaScript chunks at gzip level 6; the preview server itself served uncompressed local assets. The browser-reported transfer column is the actual Resource Timing value from these preview runs, not a Cloudflare production transfer measurement.

## Interpretation and limits

The small byte reduction comes from removing `TopBarControls` and a duplicate terminal island; React remains on the page for the terminal, so the shared React runtime remains. The click-response and localhost navigation differences are too small to support a user-visible speed claim. This did not model Cloudflare Brotli, reader network conditions, CPU throttling, or third-party requests. Browser `transferSize` accounting can reflect caching, while decoded bytes show the resource bodies known to Resource Timing. Use the exact raw records for any re-analysis.

The candidate also avoids relying on React hydration for theme/accessibility controls and handles denied/full local storage without breaking terminal actions. Those are behavior/reliability benefits validated by the regression suite, rather than inferred from the performance numbers.
