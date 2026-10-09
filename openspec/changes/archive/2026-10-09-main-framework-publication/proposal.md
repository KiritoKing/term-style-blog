## Why

Merging framework fixes into main currently passes CI but leaves production on an older framework until another content event. The owner explicitly requests automatic publication after main updates.

## What Changes

- Add a main-only push trigger to the existing immutable publication workflow.
- Resolve the currently published content reference from the canonical public publication metadata; revalidate its immutable manifest and complete sanitized snapshot before using it.
- Retain content events, manual modes, policy gates, environment approval, preview acceptance, serialized uploads, freshness rejection and recovery.
- Add offline deterministic regressions and document bootstrap/stale-content failures.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `publication-deployment`: main pushes bind the pushed framework commit to validated, already-published content and fail safely if resolution fails.
- `ci-workflow-roles`: main publication is separate from credential-free source CI; PRs and forks never publish.

## Impact

Production workflow, standalone Node validators, synthetic deployment tests, operational docs and agent records. No new dependencies, credentials, external permissions or production operation during development.
