# Pele / Mermaid benchmark

This benchmark compares the `main` renderer with a **Pele-only** candidate. The candidate removes Mermaid from runtime dependencies and has no Mermaid import or compatibility fallback. It retains a failed diagram's source block and announces when the preview cannot render.

## Versions and input

- Baseline commit: `7577a11e1a35535def2d082b65217fdac5982e2a` (`main`).
- Candidate: this PR, `pele@1.6.0`, no Mermaid runtime dependency.
- Environment: Node `26.0.0`, pnpm `10.28.0`, Astro `7.3.2`, Playwright `1.63.0`, Chromium `153.0.8010.12`.
- Both revisions used five demo posts from the checked-in Markdown fixture source. The repository demo articles have no diagrams, so the browser harness injects the exact four Mermaid flowchart sources from the public Chinese article [ai-productivity-paradigm](https://chlorinec.top/posts/ai-productivity-paradigm/). The checked-in source is `tests/fixtures/mermaid/real-blog-flowcharts.json`.
- Viewport: `390 × 844`, device scale 1. Each measurement uses a fresh browser context. The local benchmark server binds an ephemeral loopback port; external requests are blocked.

## Client download and render measurements

The harness records all successful JS responses under `/_astro/*.js` during the article navigation and chart enhancement. Raw bytes are response-body lengths; gzip is computed for each response at zlib level 9. This includes app entrypoints and dynamically loaded diagram code, but excludes HTML, CSS, fonts, images, CDN compression, caching, and network latency.

Render time begins when the four chart blocks are injected after the article shell reaches `networkidle`. It ends at the single `blog:mermaid-rendered` event after all four diagrams are marked complete and two animation frames pass. The baseline event has no count detail, so the harness also requires all four completion markers; the Pele event reports `detail.count === 4`. This is renderer enhancement time, not navigation-to-render or a live-user metric.

| Revision / page | JS files | Raw JS | Gzip JS | Five render observations (ms) | Median |
| --- | ---: | ---: | ---: | --- | ---: |
| Mermaid baseline, no charts | 11 | 232,158 B | 75,870 B | — | — |
| Mermaid baseline, four charts | 38 | 1,020,129 B | 282,461 B | 161.7, 167.6, 152.9, 168.4, 167.1 | 167.1 |
| Pele-only, no charts | 10 | 232,410 B | 75,713 B | — | — |
| Pele-only, four charts | 22 | 365,875 B | 127,855 B | 68.2, 58.9, 55.0, 64.6, 72.4 | 64.6 |

| Chart-page increment over its no-chart control | JS files | Raw JS | Gzip JS |
| --- | ---: | ---: | ---: |
| Mermaid baseline | 27 | 787,971 B | 206,591 B |
| Pele-only | 12 | 133,465 B | 52,142 B |
| Reduction | 15 fewer | 654,506 B (83.06%) | 154,449 B (74.76%) |

The four-chart page itself transfers 654,254 fewer raw JS bytes (64.14%) and 154,606 fewer gzip bytes (54.74%) in this local measurement. The chart enhancement median is 102.5 ms lower (61.3%) for the four source diagrams. Five runs on one local headless browser are a small sample; the timing result is directional and does not predict user-perceived production latency.

Baseline and candidate each emitted one completion event per run. Candidate event detail count was 4 for all five runs. The four mobile viewBoxes were baseline `1010.17 × 70`, `438.91 × 486`, `841.44 × 174`, and `276 × 718`; Pele produced `228 × 544`, `367 × 336`, `355 × 316`, and `247 × 664`. Pele adapts wide LR layouts into vertical layouts. Chinese labels remained readable, and the document had no horizontal overflow (`0px`) in the measured viewport.

## Build measurements

Five clean `pnpm build` runs per revision; the build harness removes `dist` before each run and records successful wall time and emitted `_astro/*.js` byte totals. Node/pnpm/Astro versions match the browser test above.

| Revision | Build observations (s) | Median | Emitted JS files / raw bytes |
| --- | --- | ---: | ---: |
| Mermaid baseline | 2.200, 2.164, 2.157, 2.155, 2.157 | 2.157445 s | 107 / 3,622,010 B |
| Pele-only | 2.587, 1.998, 2.005, 2.005, 1.992 | 2.004571 s | 66 / 934,339 B |

The candidate emitted 2,687,671 fewer JS bytes across the site (74.2%). Its measured build median was 153 ms lower (7.1%), though one candidate run was a 2.587 s outlier; the other four were 1.992–2.005 s. These are local build outputs, not a promise about another machine. Pele removed the previous Mermaid-related >500 kB chunk warning in this build.

## Compatibility and security exercised

Unit samples rendered flowchart, sequence, class, state, ER, journey, Gantt, pie, mindmap, and xychart diagrams; all four real flowcharts and CJK labels were tested. A quoted CJK xychart form rendered, while the unquoted probe did not. Playwright checks cover mobile and desktop sizing, site light/dark theme variables, safe external links with `noopener noreferrer`, and a `javascript:` URL. A Vitest security unit test passes an actual node label containing `<img onerror>` and `<script>` input; Pele output did not contain executable markup. `images: false` disables remote diagram images.

This intentionally accepts compatibility differences. Mermaid theme/init directives and `themeVariables` are not applied by Pele; HTML labels are not preserved; Mermaid JavaScript callback clicks are unsupported; plugin-specific directives and Mermaid extensions are not available. Chart layout and some syntax may differ or fail to parse. Unsupported diagrams show the original source with a status message; there is no Mermaid fallback. This comparison does not certify every Mermaid syntax form or every Pele security edge case.

The user explicitly accepted removing the Mermaid fallback. Pele chunk-load or render failures are covered: the original code block remains visible with an accessible error status. Async mounts are generation-checked after completion and destroyed if Astro navigation has already invalidated the owning article.

## Reproduce

From the PR checkout, with the documented Node/pnpm versions:

```sh
mkdir -p /tmp/pele-baseline
git archive 7577a11e1a35535def2d082b65217fdac5982e2a | tar -x -C /tmp/pele-baseline
cd /tmp/pele-baseline
pnpm install --frozen-lockfile
pnpm build
```

Then from the PR checkout (which contains the harness and four-chart fixture):

```sh
node scripts/benchmark-build.mjs --project-root /tmp/pele-baseline --runs 5 --output /tmp/pele-baseline-build.json
node scripts/benchmark-mermaid.mjs --site-root /tmp/pele-baseline/dist --fixture "$PWD/tests/fixtures/mermaid/real-blog-flowcharts.json" --runs 5 --output /tmp/pele-baseline-browser.json
pnpm build
node scripts/benchmark-build.mjs --project-root "$PWD" --runs 5 --output /tmp/pele-pele-build.json
node scripts/benchmark-mermaid.mjs --site-root "$PWD/dist" --runs 5 --output /tmp/pele-pele-browser.json
```

The scripts save all repeated raw results, including each response URL and raw/gzip byte size, per-run all-chart timings, event counts, viewBoxes, build durations, and emitted JS totals. Browser runs use local headless Playwright Chromium; they do not use the user's interactive browser or production CDN.
