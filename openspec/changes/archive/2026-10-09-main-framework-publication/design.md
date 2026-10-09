## Context

PR21 merged at 79737bce33fe2d53846187c660a8395c6b667c47 while production remains on eefd2ba. Existing publication accepts only content dispatch/manual input. The owner authorized adding automatic main publication, with review before merge.

## Goals / Non-Goals

Publish pushed main framework commits using existing accepted content and unchanged security gates. Preserve secret-free PR CI. No direct main writes, workflow dispatch, credential changes, content edits or production deployment during this task.

## Decisions

- Add `push.branches: [main]`, with an explicit prepare guard for owned repository, main and allowed events; reject deleted branch pushes in input validation.
- For push only, read the fixed public `https://chlorinec.top/publication.json` endpoint without credentials, redirects or unbounded responses. Require valid production metadata and identity digest; resolve only full content SHA and manifest SHA-256 plus fixed repository/branch.
- Checkout exactly that content SHA with the existing read-only publication key. Derive tree hash only from the manifest whose bytes match the pinned hash; run the complete existing snapshot validator before normalizing inputs. No vault-wide checkout or private metadata outputs.
- Bind framework to `github.sha`, never mutable main. Push uses the same false/manual defaults as content events and production only under true/automatic.
- Keep serialized production jobs, environment protection and both branch-tip checks. Recheck both tips again immediately before upload inside the lock so downloaded artifacts/setup cannot hide an intervening advance. No cancel-in-progress for uploads. Old runs reject, and cannot overwrite a newer completed run.
- Keep GITHUB_TOKEN at contents:read. No API access to Actions histories/artifacts, no new token/secret, no fixture fallback in deployment.

## Risks / Trade-offs

Public production metadata is now required for framework push resolution. Missing/invalid/preview metadata fails before private checkout; bootstrap uses existing explicit immutable content dispatch or manual workflow. A publication branch ahead of the published content causes stale rejection; its normal content event (or authorized manual retry) must complete. This avoids publishing unaccepted new content implicitly. Branch checks cannot eliminate a source advance in the few moments after the last read, but serialization prevents an older run overwriting an already deployed newer run; the next current run converges.

## Test design

All tests use synthetic environments, injected fetch responses, temporary git repositories and the existing exporter-v1 synthetic snapshot. No Cloudflare/Notion/private content network calls.

- node unit/fixture_validation: valid production reference, metadata digest, malformed/preview/empty/HTTP/redirect/oversized failures; immutable manifest/tree/content validation.
- node unit: push mode true/automatic and defaults, deleted/non-main/fork/PR rejection, immutable SHA and missing input failures; existing event/manual tests remain.
- workflow regression: main trigger/no PR, exact SHA handoff, fixed sparse checkout, failure dependencies, read-only permissions, production environment, locks, two freshness checks and acceptance order.
- concurrency integration: execute actual freshness shell with temporary git remotes; current candidate passes, advanced framework/content or wrong checkout fails before upload.
- real-corpus browser acceptance: synthetic demo suite is fixture-only; discover unlinked body image routes from built publication HTML and test open/zoom/Escape/focus/Astro navigation/repeated close. No private article slug hardcoded.
- openspec_validation, complete deployment/unit suites, Astro type check and public fixture build. Existing browser acceptance remains in publication and CI; no UI implementation changes.

## Migration Plan

Review and merge PR normally. The merge push itself starts publication of that new framework SHA under existing true/automatic policy, using current public accepted content. No new configuration is required for the already configured owner installation. Monitor hosted identity and production acceptance after merge; do not declare production success from development tests.
