## 1. Tests before implementation

- [x] 1.1 [e2e/component] Add public schema-valid demo and processed-root/data/linked fixtures; record red on opening.
- [x] 1.2 [e2e] Cover keyboard, three close paths, inert/focus/scroll, duplicate initialization and Astro return navigation.
- [x] 1.3 [e2e/axe_smoke] Check wide/tall geometry, both themes, 390px, no JS and unsupported native commands; capture screenshots.
- [x] 1.4 [unit/deployment] Add isolated workflow boundary regression before implementing workflow.
- [x] 1.5 [e2e] Cover zoom buttons/wheel, min/max scale, bounded drag, touch pinch/pan, reset, resize and per-open state.

## 2. Implementation

- [x] 2.1 Add native dialog Astro component and minimal enhancement lifecycle with lazy Panzoom only.
- [x] 2.2 Add terminal viewer CSS and body integration, retaining original images and linked-image behavior.
- [x] 2.3 Add exact-SHA public-demo preview workflow using only existing controlled Actions credentials.

## 3. Acceptance and delivery

- [x] 3.1 Run frozen install, Vitest, deployment tests, check, preview build, all Chromium E2E, strict change validation and diff lint.
- [x] 3.2 Create draft PR, deploy isolated preview and verify exact SHA/noindex/new feature online; upload screenshots to Library.
- [x] 3.3 Write report/handoff/registry, synchronize accepted specs and archive implementation change; record any external blocker explicitly.
