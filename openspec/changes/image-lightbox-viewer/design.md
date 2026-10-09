## Context

Astro 7.3.2 renders `<Content />` in `.prose-terminal`; remote/data images already become lazy HTML images, root assets keep Astro processing. ClientRouter emits `astro:page-load` and swaps article DOM. Baseline is the user's compatibility boundary.

## Goals / Non-Goals

**Goals:** Accessible native modal, terminal blue/green style, responsive original image, lazy community pan/zoom with bounded scale and drag/pinch/reset, public demo and immutable isolated preview.

**Non-Goals:** Cover pipeline, gallery navigation, rewriting gesture recognition, private publication snapshots, production deployment, legacy-browser polyfills.

## Decisions

- `ImageLightbox.astro` supplies static dialog markup outside indexed prose. Native `commandfor`/`command` opens it; `form method="dialog"` closes it. Small TypeScript prepares the image on the dialog's direct `command` event, wraps unlinked images only after feature detection, handles backdrop clicks and Astro lifecycle. Native modal provides inert background, focus containment and Escape; explicit focus return covers mouse activation too.
- CSS contains geometry, scroll locking for document and terminal scrollers, square pixel-panel/pixel-btn treatment, backdrop and light/dark colors. Never assume `closedby` support; detect actual outside pointer-down and click to avoid closing after image drag.
- Keep original DOM image and all attributes. Skip interactive ancestors and wrap its `<picture>` when present. Viewer loads only on activation; title falls back to alt and a generic accessible label. Source selection uses the image src/srcset or picture sources, keeping responsive assets.
- `image-panzoom.ts` loads `@panzoom/panzoom` 4.6.2 (MIT, no transitive dependencies, published 2026-04-02) in a dynamic chunk on first open. The native package's pointer/pinch recognition, focal wheel zoom and containment handle gestures. A fitted stage-sized frame has minScale=1/maxScale=5 and outside containment; buttons and keyboard offer zoom, reset and pan. Reset on viewport resize and every new image. Close/swap cancels async initialization, destroys listeners and clears images. Actual gzip chunk sizes will be measured from build, not inferred from README. Primary sources: [Panzoom repository](https://github.com/timmywil/panzoom), registry publication metadata.
- `commandfor` is Baseline Newly available (Chrome 135, Firefox 144, Safari 26.2); dialog is Widely available. `:has()` and dynamic viewport units are also Baseline. No invokers-polyfill: although MIT v1.0.4 is actively maintained (2026-08-20), the user's boundary supplies no real gap. Source: [MDN BCD button](https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/button.json), [dialog](https://raw.githubusercontent.com/mdn/browser-compat-data/main/html/elements/dialog.json), [Web Platform Status](https://webstatus.dev/features/invoker-commands), [Chrome declarative guidance](https://github.com/GoogleChrome/modern-web-guidance-src/blob/main/guides/ui-behaviors/declarative-dialog-popover-control/guide.md).
- Preview workflow triggers only pushes to the explicitly authorized same-repository feature branch. Build/test job has no secrets; deploy job consumes its artifact, verifies full commit identity and preview policy, then uses existing Cloudflare/Access secrets only in Actions. No private checkout, repository_dispatch, main upload, new permissions, credentials or paid services.

## Test Strategy and Testability

Before implementation, Playwright regression uses a public synthetic demo (`src/content/blog/image-lightbox-demo.md`, generated images under `public/demo/`). It covers component behavior and E2E integration, mouse/keyboard opening, three close paths, caption/alt/title/lazy preservation, focus/inert/scroll, dimensions in four theme/viewport combinations, linked images, data/processed root sources, repeated init and Astro navigation. No new routing logic or pure domain helper warrants mirrored unit/component mocks; real rendered Astro component is exercised in the browser. Existing Vitest fixture/content schema tests and full check/build verify the demo; Node unit tests cover preview security boundaries. axe smoke uses dev-only axe-core Playwright. Existing real-corpus tests are explicitly skipped without private sources. Coverage is Chromium only.

## Risks / Trade-offs

- Older browsers lack invokers → leave original readable images without dead controls.
- Cloudflare Access blocks anonymous previews → verify exact page and screenshot inside existing authenticated Actions; user opens URL through normal Access login, never weaken protection.
- GitHub CLI authentication fails in Cloud → connector can create draft PR; workflow push permissions and Actions startup must be reported from actual outcomes.

## Migration Plan

Feature branch and draft PR only. Preview noindex defaults; existing production workflow is unchanged. Rollback is closing PR or removing branch preview; no production action needed.

## Open Questions

None for implementation. Hosted acceptance depends on existing secret/Actions access.
