# Report: B06 manual-preview-deployment-policy

Status: pass; accepted by Root
Owner: /root/publisher
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09

## Changes

- Added strict deployment policy resolution. Missing `PUBLICATION_PRODUCTION_ENABLED` resolves to `false`; missing `PUBLICATION_PREVIEW_REVIEW` resolves to `manual`. Invalid non-empty values fail closed.
- Preserved the exact `content_published_changed`, framework `main`, immutable content payload and SHA-bound dispatch-id contract. Repository dispatch resolves to production only when production is exactly `true` and review is exactly `automatic`; every other valid combination remains preview.
- A manual `production-retry` now rejects before checkout unless the same production and automatic-review gates are present.
- Manual review validates the immutable snapshot, strict preview assets, local noindex output, real-corpus/listing browser suite and Cloudflare preview outputs. It does not fetch the preview URL. The Actions summary says `online_acceptance=pending` and explicitly excludes Access/login content as evidence.
- Manual preview writes and preserves `preview-deployment-record.json` with framework/content SHA, manifest/source-tree hash, deployment id, preview URL, preview environment and pending acceptance. It contains no credential value.
- Automatic review retains the prior HTTPS HTML/robots response checks. Every production build/upload condition repeats the three policy predicates as defense in depth.
- Added and strict-validated the B06 proposal, design, test strategy, delta and tasks before implementation. Updated the delivery plan and registry.
- After all tasks passed, OpenSpec synced both modified requirements into the base specification and archived the change as `2026-09-08-manual-preview-deployment-policy`.

Final implementation SHA-256:

- workflow: `563b57bed8c815f43ef7710ac55eadfec156cfb17f7c8c05b57b8e7731988dfd`
- resolver: `02180cd024e6a08dec6243afd67998d3f80b668339bd8d4921e363d423485b1e`
- tests: `cd8c7b0ee7a241474e0067e176c7afde541290309fb5e688dde54a1d5268bc5e`

## Verification

- RED: `node --test tests/validate-publication-snapshot.test.mjs` produced 15 pass / 5 fail before implementation. Failures covered the default dispatch mode, explicit opt-in outputs, invalid policy, forbidden production retry and workflow wiring.
- GREEN: `pnpm test:deployment` passes 21 tests. New cases cover missing defaults, both one-gate-only dispatch combinations, full automatic opt-in, invalid policy values, production retry rejection and static manual/automatic workflow separation.
- `pnpm test` passes 112 existing Vitest tests across 9 files.
- `pnpm check` passes with 0 errors, warnings or hints.
- Ruby Psych parses the deployment workflow and `bash -n` passes all 22 extracted run blocks.
- `node --check scripts/validate-publication-snapshot.mjs`, registry YAML parse, strict change validation before archive, strict synchronized `publication-deployment` spec validation after archive and `git diff --check` pass.
- No credentials, network request, remote write, Git operation, dispatch, Pages deployment, content edit or generated site rebuild occurred.

## Remaining integration

- Root should review and commit/push through the existing PR flow. `README.md` is a root-owned concurrent documentation change in this same worktree and was not edited by B06.
- Root has independently configured and read back `PUBLICATION_PRODUCTION_ENABLED=false` and `PUBLICATION_PREVIEW_REVIEW=manual`; this task did not access or mutate GitHub settings.
- A real dispatch must download the preview deployment record, match it to the intended immutable content snapshot and keep online acceptance pending until a human verifies the actual preview behind Access.
- Production stays blocked until the accepted preview gate is complete and the separately authorized repository policy is changed to the explicit automatic production combination. No live workflow behavior is claimed by local tests.


## Root acceptance

Root reviewed the final resolver, workflow, tests and synchronized specification, and independently reran deployment tests: 21/21 pass; diff check clean. The policy cannot promote a manual preview even with the production flag enabled. No site rendering source changed, so the accepted B03/B05 visual artifact remains applicable. B06 is done with locks released. Live integration is tracked separately and does not change pending online acceptance into a pass.
