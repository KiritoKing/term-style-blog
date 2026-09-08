# Change: Integrate immutable publication deployment

## Why

B01 can build an approved Obsidian publication snapshot without Notion, but the repository has no reviewed workflow that binds a deployment to immutable framework and content commits. A deployment must prove the snapshot manifest and generated site's indexing mode before Cloudflare can receive it, while local validation remains independent of live credentials.

## What Changes

- Add a GitHub Actions workflow for the fixed `content_published_changed` dispatch and explicit manual preview or production retry.
- Bind framework and publication inputs to immutable SHAs, the fixed private publication repository/branch, manifest SHA-256 and source tree hash.
- Add a dependency-free ESM validator for trigger inputs, exact publication snapshots and preview/production site modes.
- Build and verify an isolated preview first, then rebuild production metadata from the same immutable inputs and serialize only current production candidates.
- Add Node tests to the package scripts, offline CI and deployment workflow without requiring Cloudflare secrets for local validation.

## Impact

- New capability: `publication-deployment`.
- Modified files after this proposal: `.github/workflows/deploy-publication.yml`, `.github/workflows/ci.yml`, `scripts/validate-publication-snapshot.mjs`, `tests/validate-publication-snapshot.test.mjs`, `package.json`, and B02 state/report files.
- No B01 rendering/content implementation, source vault, `dist`, Git remote, credentials or live Cloudflare state changes.
