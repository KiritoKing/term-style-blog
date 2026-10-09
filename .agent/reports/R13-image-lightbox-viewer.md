# Report: R13 image-lightbox-viewer

Status: partial (implementation validated; remote delivery pending)
Owner: codex-cloud-01a1197f
Branch: feat/post-image-lightbox
Base: eefd2ba094c14f9cd2238ab4930e6983729f9454 (remote main rechecked 2026-10-09)

## Behavior and scope

User explicitly authorized body-image viewing, advanced zoom/pan, a draft PR and isolated demo deployment. This body-only delivery supersedes the historical R12 cover prerequisite; cover selection and production publication remain outside this change. Images in `.prose-terminal` gain native `commandfor`/`command` invokers and a native dialog; linked images retain their links. Original images retain alt/title/source attributes, Astro processing and existing lazy-loading behavior. No-JS or unsupported commands retain readable images. The viewer reuses square pixel panels/buttons, light blue/dark green, fits wide/tall images, locks actual reading scrollers, supports Escape/close/backdrop with focus return, and handles Astro return navigation and repeated activation.

Panzoom supports buttons, focal wheel zoom, mouse/touch drag, two-finger pinch, keyboard +/-/0/arrows, bounded 1–5 scale, fit/reset and resize. Gesture state and delayed initialization are disposed on close/navigation. Native dialog handles modal inertness and focus containment; `closedby` is not assumed.

Runtime dependency: pinned @panzoom/panzoom 4.6.2 (MIT, published 2026-04-02, no transitive dependencies), dynamically loaded on first activation. No invoker polyfill or React island. Eager viewer bundle: 2,323 bytes / 1,163 gzip; deferred Panzoom+adapter: 10,898 / 4,101 gzip in the validated build. Dev-only @axe-core/playwright 4.13.0 adds accessibility smoke checks. Native command support is Baseline 2025 (December 2025); older browsers keep readable body images. Sources: https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement/commandForElement and https://github.com/timmywil/panzoom .

## Tests and evidence

Tests preceded implementation. With the new public demo but the original main post template, opening and lazy-module tests fail because zero invokers exist (expected four); logs `/tmp/lightbox-red-fixture-e2e.log`. The workflow regression failed before workflow/identity implementation (`/tmp/lightbox-red-workflow.log`). Fixtures are repository-owned synthetic landscape, portrait and inline data PNG; an existing image link and empty-alt case are included.

Pinned pnpm 10.28.0 frozen install passed. Vitest 112/112; deployment tests 45/45; Astro check 0 errors/0 warnings (31 pre-existing Zod deprecation hints); preview build and preview site validator passed. Chromium suite covers native commands, focus/inertness, all close paths, actual light/dark colors, 1440/390px wide/tall geometry, linked/data/empty-alt images, lazy loading, no JS, unsupported commands, Astro navigation/duplicate page-load, wheel/buttons/keyboard/boundaries/resize/reopen, actual CDP touch pinch/pan, delayed import and axe. Full Chromium suite: 31 passed / 11 skipped; all 13 new viewer cases passed. Log: `/tmp/lightbox-all-e2e.log`. Eleven private-corpus tests intentionally skip with public fixtures. Strict OpenSpec validation and git diff lint pass.

Coverage is Chromium only (system Chromium 151.0.7922.173 locally; Actions installs Playwright's Chromium). No Firefox, WebKit or physical-device claim. System Chromium suppresses tap-generated click after CDP synthetic drag even on a minimal plain HTML button without any app JS; native touch toolbar taps are tested before CDP gesture input, then gestures and keyboard reset/Escape are verified. No timing-based product workaround is added. Native touch controls after real-device gestures remain a physical-device coverage limitation.

## Isolated deployment contract

Independent `preview-image-lightbox.yml` runs only this owned feature branch. Build/test use repository public content and no deployment secrets. It stamps the full feature SHA in all HTML and `_feature-preview.json`, uploads/downloads the artifact under that SHA, verifies preview/noindex policy, and deploys only `feature-image-lightbox` on the existing `notion-astro-rev` Pages project. Existing Cloudflare and Access credentials are consumed only by controlled Actions. Hosted checks reject auth/stale pages and verify SHA/noindex, zoom/reset/focus in both themes at desktop/mobile widths; auth headers are restricted to the exact validated preview origin with redirects/external requests blocked. Production publication workflow is unchanged; no private snapshots/vault/Notion are read. No credentials are created/read locally.

## Delivery update

Draft PR: https://github.com/KiritoKing/term-style-blog/pull/21 . Initial preview run 37883841154 caught a CDP test-helper TypeScript annotation error introduced during final touch-input refinement; corrected with literal event types and typed coordinates. Hosted preview remains pending. Library helper fails before upload preparation with hosted-app network discovery unavailable, including an unsandboxed retry; no Library IDs have been created. Public screenshot PNGs are retained in Actions artifacts and /workspace/lightbox-deliverables. No localhost or build success is treated as deployed acceptance.

OpenSpec: image-lightbox-viewer and explicit public-demo CI exception; synchronize/archive after delivery outcome is recorded. No merge or production deployment authorized.
