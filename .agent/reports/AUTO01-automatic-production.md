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
- Final 40/40 deployment tests pass, independently rerun by reviewer. Coverage includes origin-limited auth, stale identity, production-only 404 propagation, legitimate Access technical articles, drained worker pools and terminal auth failure taking priority over concurrent retryable errors.
- Astro check has zero errors/warnings; 31 baseline specs plus the new change pass strict validation. Workflow YAML and 26 Bash steps pass.
- Independent reviewer: pass with live integration limits.
- Cloudflare free plan activation confirmed, dedicated one-year Access token created and both GitHub Secrets stored. Existing Access policy binding awaits an operable browser window; current token alone grants no application access.
- GitHub production variables remain false/manual until protected hosted acceptance works.

## Remaining integration
Exact-head CI/merge, Access policy binding, protected preview acceptance, explicit production opt-in, real source save plus restoration through Sync, and final immutable production/browser evidence. Do not claim completion from unit tests or secret creation alone.
