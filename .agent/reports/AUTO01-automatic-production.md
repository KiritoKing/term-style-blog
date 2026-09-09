# AUTO01 automatic production publication

Status: in_progress

## Authorization and scope
The owner explicitly requested saving approved Obsidian content to update the formal site. On 2026-09-09 the owner also approved the required Cloudflare account setup. Root owns shared workflow, project configuration and live integration. The bounded verifier worker owns the hosted verifier/test only.

## Implementation
The publication workflow stamps source identity on generated HTML, verifies the protected hosted preview route inventory, then separately builds/promotes production under explicit policy. The public canonical domain must match the accepted artifact. A before-upload deployment record allows conditional rollback only while this run owns production; the old Notion Git writer must remain disabled. Live Sync/exporter ownership is unchanged.

## Verification so far
- 112 existing unit tests pass.
- Strict 53-article preview build and 29 real Chromium tests pass.
- Root production backup/rollback fixture tests pass, including rejection of another run's candidate.
- 40/40 deployment tests were independently rerun by reviewer; the final CodeQL repair adds two regressions, bringing the suite to 42/42. Coverage includes origin-limited auth, stale identity, production-only 404 propagation, legitimate Access technical articles, drained worker pools and terminal auth failure taking priority over concurrent retryable errors.
- Astro check has zero errors/warnings; 31 baseline specs plus the new change pass strict validation. Workflow YAML and 26 Bash steps pass.
- Independent reviewer: pass with live integration limits.
- Cloudflare free plan activation confirmed, dedicated one-year Access token created and both GitHub Secrets stored. Existing Access policy binding awaits an operable browser window; current token alone grants no application access.
- GitHub production variables remain false/manual until protected hosted acceptance works.

## Remaining integration
Exact-head CI/merge, Access policy binding, protected preview acceptance, explicit production opt-in, real source save plus restoration through Sync, and final immutable production/browser evidence. Do not claim completion from unit tests or secret creation alone.

## CI security follow-up

Initial head 8dbee31 passed source CI but CodeQL flagged double entity decoding and incomplete script-end-tag text extraction. Root changed title decoding to a single pass and handled tolerated end-tag whitespace; two fixtures prove literal nested entities remain literal and non-rendered script/style text cannot satisfy the content check. No rule was disabled or alert dismissed. Updated exact-head security checks remain required before merge.

## Merged implementation; activation checkpoint

PR #11 merged as `f23f5b74cabe294f54f213415eee416a6d034ce6`. Candidate `4386ecdceda909614a46d212508e6060e57b35c5` passed CI run `34335563463` and all three CodeQL analyses plus the aggregate CodeQL gate. The fetched merge tree is identical to the accepted candidate. No alerts were dismissed.

On 2026-09-09, live GitHub variables remain `PUBLICATION_PRODUCTION_ENABLED=false` and `PUBLICATION_PREVIEW_REVIEW=manual`. Cloudflare Zero Trust free activation succeeded with explicit user billing authorization; both Access secrets are stored, but the service token is not yet bound to the existing Pages application. Native Chrome exposes only a window title, and a fresh extension connection timed out. Screen lock is suspected, not proven. No source-save canary has run; automatic production is not yet enabled or accepted.

Resume from branch `codex/automatic-production-activation-20260909` in `/tmp/term-blog-open-source-20260909`. Bind the existing token using a Service Auth policy while retaining human access, enable automatic preview review with production still disabled, accept an actual immutable protected preview, then enable production and observe source-save plus byte-exact restoration through the normal Sync/exporter events. Private recovery state and the guarded probe are under `/tmp/term-blog-open-source-audit-20260909/auto-production`. Do not recreate the existing service token or archive the change before live acceptance.

## Live activation and first source-save finding

The existing Pages Access application now retains human Allow plus a Service Auth rule restricted to the dedicated token. Protected preview run34350240034 passed103 hosted routes; anonymous requests still302 to Access. Both automatic policy variables are enabled.

A temporary frontmatter comment saved at12:21:05UTC reached Sync history at12:23:43UTC and Hermes with the exact new hash. The normal exporter produced content6934c09 and repository_dispatch run34350956620 at12:25:44UTC. Preview passed, but production failed before upload: Wrangler could not locate pnpm on its fresh job runner. Root adds pinned pnpm/Node setup plus a RED/GREEN workflow regression. Source canary still awaits restoration; end-to-end production is not accepted yet.

## Deterministic concurrency fixture repair

Runtime fix PR12 merged as572aa721. Repeat real save produced6c1ce11 and normal dispatch34351742631, but the concurrency test intermittently measured1 instead of2 because its1ms delay raced asynchronous fixture reads. No deployment ran. Replace wall-clock delays with a two-request barrier plus an event-loop drain boundary, preserving the exact concurrency and completion assertions. Production E2E remains pending and the guarded source canary still needs restoration.
