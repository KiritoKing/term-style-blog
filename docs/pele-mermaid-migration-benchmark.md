# Pele / Mermaid migration benchmark

This records the local comparison used for the Pele migration proposal. The change routes ordinary diagrams through Pele and keeps Mermaid as a lazy compatibility fallback. It does not remove Mermaid from the dependency graph.

## Scope and method

- Repository base: `main` at `7577a11e1a35535def2d082b65217fdac5982e2a`.
- Candidate: this branch, with `pele@1.6.0`; baseline uses the base revision and `mermaid@11.17.2`.
- Runtime: Node `26.0.0`, pnpm `10.28.0`, Astro `7.3.2`, Playwright `1.63.0` with its bundled Chromium revision `1243`.
- Browser measure: local production build served on loopback; headless Playwright Chromium; new browser context per run; viewport `390 × 844`; external requests blocked. We measured the same built article shell with no diagram and with the four exact diagram source blocks extracted from the published article [`ai-productivity-paradigm`](https://chlorinec.top/posts/ai-productivity-paradigm/). The checked-in source repository's demo corpus has no Mermaid diagrams, so the published page is the real-content fixture.
- “JS bytes” means the sum of JavaScript response bodies requested from the local `/_astro/` path. Gzip bytes are computed per response using Node zlib level 9. This measures downloaded JS resources without caching; it is not transferred size from the production CDN (which may use Brotli, caching, or different headers). HTML, CSS, fonts, images, and network latency are excluded.
- Each browser case ran five times, with a fresh context each time. “Ready” is elapsed time from navigation start to `blog:mermaid-rendered` for a diagram page, or `networkidle` for the no-diagram control. Values below are milliseconds; medians are calculated over the five raw observations.
- Production `pnpm build` ran five times per revision with the same dependency installation and build command. Build timing includes content/redirect prebuild scripts and Pagefind. The first baseline build is a cold optimizer run; subsequent runs are the warm comparison. `dist` was regenerated before each run.

## Client payload and readiness

| Revision / page | JS files | JS raw bytes | JS gzip bytes | Ready observations (ms) | Median (ms) |
| --- | ---: | ---: | ---: | --- | ---: |
| Mermaid baseline, no diagrams | 11 | 232,158 | 75,870 | 544.835, 543.561, 542.449, 541.251, 541.790 | 542.449 |
| Mermaid baseline, four diagrams | 38 | 1,020,129 | 282,461 | 607.200, 598.882, 603.570, 601.775, 602.987 | 602.987 |
| Pele candidate, no diagrams | 11 | 233,292 | 76,370 | 578.059, 544.161, 544.613, 543.261, 543.306 | 544.161 |
| Pele candidate, four diagrams | 23 | 366,757 | 128,512 | 579.231, 572.651, 571.367, 589.972, 589.240 | 579.231 |

| Diagram-only increment (four diagrams minus same revision's control) | JS files | Raw bytes | Gzip bytes | Ready median |
| --- | ---: | ---: | ---: | ---: |
| Mermaid baseline | 27 | 787,971 | 206,591 | 60.538 ms over its control |
| Pele candidate | 12 | 133,465 | 52,142 | 35.070 ms over its control |
| Candidate change | −15 | −654,506 (−83.06%) | −154,449 (−74.76%) | −23.756 ms vs baseline four-chart page |

The candidate's four-chart page downloads 653,372 fewer raw JS bytes (153,949 fewer gzip bytes) than the baseline four-chart page. The no-chart controls are close: the candidate adds 1,134 raw / 500 gzip bytes and its median is 1.712 ms slower. The readiness observation is noisy and includes local navigation and browser scheduling; five runs are not enough to claim a general latency improvement. The defensible measured benefit is the large reduction in diagram-page JavaScript payload and script count.

## Build output and time

| Revision | Build wall times (s) | Warm median (s) | Emitted JS files | Emitted JS raw bytes |
| --- | --- | ---: | ---: | ---: |
| Mermaid baseline | 7.232, 2.208, 2.247, 2.236, 2.229 | 2.236 | 107 | 3,622,010 |
| Pele candidate | 2.279, 2.305, 2.225, 2.219, 2.213 | 2.225 | 161 | 4,303,459 |

The first baseline run was cold and is excluded from its warm median. Candidate warm build time changed by −11 ms (−0.5%), which is not meaningful at this sample size. Pele plus the retained Mermaid fallback increases the sum of emitted JS chunks by 681,449 bytes (18.8%) across the whole site, although non-diagram pages do not load those new diagram chunks. This migration is a client payload optimization for pages with diagrams, not a build-time rendering optimization or a whole-site output-size win.

## Content and compatibility checks

The real page contains four Chinese flowcharts using `flowchart LR` / `flowchart TD`. Under the tested `390 × 844` viewport, Pele produced all four SVGs with Chinese labels intact and no document-wide horizontal overflow. Pele adapted the wide LR charts into compact vertical layouts (observed viewBox sizes: `228 × 544`, `367 × 336`, `355 × 316`, `247 × 664`); this is a meaningful layout change, not a pixel-identical rendering. The old Mermaid outputs had viewBox widths `1010.17`, `438.91`, `841.44`, and `276`, with horizontal overflow for the wider charts.

Checked locally against Pele 1.6.0:

| Area | Result |
| --- | --- |
| Diagram families | Four real blog flowcharts; sequence, class, state, ER, journey, Gantt, pie, mindmap, and xychart sample diagrams rendered in the compatibility suite. |
| Mermaid-specific syntax | Mermaid init directives, HTML tags in labels, and callback-style `click` declarations route to Mermaid fallback. A quoted CJK xychart label rendered; the unquoted CJK xychart form did not parse in the test and should use fallback if such syntax is added. |
| Theme / dark mode | Pele uses site CSS custom properties for foreground, background, and accent. E2E toggles light/dark and verifies the mounted SVG's CSS styling responds. Mermaid init directives use the existing light/dark Mermaid theme in the fallback. |
| Chinese and responsive layout | Real Chinese labels preserved on the mobile fixture; adaptive direction keeps the rendered document within viewport width. Desktop and mobile cases are covered by Playwright. Font measurement can vary by browser/platform. |
| Links and interaction | Safe external diagram links render with `target="_blank"` and `rel="noopener noreferrer"`. `javascript:` links do not survive sanitization. Mermaid callback click behavior is not supported by Pele and uses fallback. |
| SVG safety | Pele output for tested script/event-handler payloads contains no executable script or event handler. Remote images are disabled with `images: false`. Mermaid fallback keeps `securityLevel: 'strict'`. |
| Astro navigation | Mounted Pele diagrams are destroyed on `astro:before-swap` to release observers/listeners. |

These are representative, not exhaustive equivalence tests. Mermaid supports more configuration, plugins, HTML labels, callbacks, and theme variables than this migration maps. The application keeps Mermaid as a lazy fallback for init directives, HTML labels, callback-style click syntax, and Pele parse/render failures. The fallback means Mermaid is not removed from built output, and the total generated JS output grows. Unsupported Mermaid syntax not recognized by these feature checks may fall back only after Pele reports an error. Review actual chart sources when updating the external blog corpus.

## Reproduction

With Node 26 and pnpm 10.28:

1. Check out the base commit and candidate commit separately, install dependencies with `pnpm install --frozen-lockfile`, and run `pnpm build` five times, removing `dist` before each run. Record wall time and sum `dist/_astro/*.js` byte sizes.
2. Use the four source blocks from the published article linked above. Build two same-shell pages per revision: one with no chart and one with all four Mermaid blocks. Serve the build locally, block external requests, set Chromium to `390 × 844`, and run each page in five fresh contexts.
3. Sum each requested `/_astro/*.js` response body; gzip each body independently at level 9. Record script count, raw/gzip totals, navigation-to-idle or navigation-to-rendered event time, and inspect each SVG viewBox and document scroll width.
4. The repository checks for this change are `pnpm test`, `pnpm check`, `pnpm build`, and `pnpm exec playwright test tests/e2e/pele-mermaid.spec.ts`.

The fixture source is checked in at `tests/fixtures/mermaid/real-blog-flowcharts.json`; its values were copied from the published page and the benchmark used the local production build. The measurement harness itself was a temporary local script and is not checked in, so reproduce the page injection and response collection described above.

## Upstream reports and remaining limits

Pele's [compatibility notes](https://pele.run/compatibility) describe support as a practical subset of Mermaid rather than a complete renderer replacement. Upstream has reports concerning sequence overlap, long tokens, subgraph edge crossings, disconnected classes, C4 type detection, and code-font handling. Those issue reports were not independently reproduced here. This work did exercise selected diagram types and the blog's real charts, but not every syntax variant, browser engine, or full external content corpus.

The browser tests ran in local headless Playwright Chromium on the developer Mac. The user's interactive Mac browser was locked and was not used. Results describe this local environment only; no production deployment or live-user measurement was performed.
