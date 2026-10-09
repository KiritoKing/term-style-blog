# Report: AUTO02 main-framework-publication

Status: done (implementation complete; draft PR awaiting owner review/merge)
Branch: feat/main-publication-autodeploy
Baseline: 79737bce33fe2d53846187c660a8395c6b667c47 (remote main rechecked before commit).
Authorization: owner requests main automatic publication. No direct main writes, auto-merge, workflow dispatch, production deploy or external account/permission changes occurred.

## Change

Owner main pushes now bind github.sha to accepted canonical production content metadata. A bounded credential-free no-redirect fetch validates production schema and revision digest; only fixed source coordinates and content/manifest hashes reach outputs. Existing read-only key checks out just the exact publication manifest and sanitized Markdown boundary. The complete snapshot is revalidated and its pinned tree hash derived before input normalization. Existing content/manual paths, safe defaults, protected preview acceptance, production environment, serialization, recovery and immutable identity remain. Both remote branch tips and local checkout SHAs are rechecked immediately before upload.

During integration, the merged viewer suite was found to require a synthetic demo article absent from real publication snapshots. Demo assertions now run only in public fixture CI; a separate real-corpus acceptance discovers unlinked body-image articles from the built artifact and checks open/zoom/Escape/focus/navigation/repeated close. This fixes a deterministic publication gate failure without changing viewer behavior or hardcoding private article slugs.

## Validation

Test design was written before implementation. New initial RED: 1 pass / 6 fail (unsupported push, missing resolver, missing workflow gates). GREEN:

- pnpm test:deployment: 53/53; main policy, missing/invalid canonical identity, redirects, 5MB response bounds, wrong source/ref/deleted/fork/PR, manifest bytes/content tamper/missing snapshot, least privilege and actual temporary-Git branch-tip advancement.
- pnpm test: 112/112.
- pnpm check: 0 errors / 0 warnings / 31 existing hints, including new browser tests.
- pnpm build: public repository Markdown, successful; no Notion/private content credentials used.
- PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test:e2e: 31 passed / 12 expected skips (11 real corpus tests + new real-only image test).
- E2E_REAL_CORPUS=1 PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm exec playwright test tests/e2e/publication-image-lightbox.spec.ts: 1 passed using the PUBLIC synthetic build. The actual private publication artifact was not accessed locally.
- actionlint 1.7.7 (official release checksum verified) for deploy-publication.yml: pass; shellcheck unavailable, so disabled explicitly. YAML parsed and all 29 run blocks passed bash -n; freshness Bash executed in synthetic Git integration.
- Node --check all three changed scripts: pass.
- OpenSpec change strict validation and git diff --check: pass.

No dependencies/client JS added. No secrets read, copied or created. GITHUB_TOKEN remains contents:read. Implementation commit fd373197ddbc6c129effef72161f7dd5d5426ab5 passed exact-head CI #38: https://github.com/KiritoKing/term-style-blog/actions/runs/37896199094. Draft PR #23: https://github.com/KiritoKing/term-style-blog/pull/23. Specs synced and change archived at openspec/changes/archive/2026-10-09-main-framework-publication; locks released. Final documentation/archive commit CI evidence will be bound to the final PR head in the PR description.

## Deployment effects and limits

The merge of this PR itself starts main publication. Existing owner true/automatic variables and credentials suffice; environment approvals remain. Missing public production metadata fails before private checkout; missing/invalid snapshot fails before build; stale framework/content fails before upload. Bootstrap/recovery uses the existing separately authorized immutable content event/manual flow. If the content branch is ahead of live metadata, its normal content publication must finish before framework-only promotion. Serialization prevents an older run overwriting an already uploaded newer run; a source change in the brief interval after the last tip read is handled by the next current run.

Latest successful production evidence remains run 37782082059 (2026-10-08), framework eefd2ba094c14f9cd2238ab4930e6983729f9454; this report makes no new production success claim. Current canonical metadata could not be freshly fetched from this Cloud shell due outbound proxy restrictions during earlier monitoring; parent cloud browser performs actual online acceptance after authorized merge.

## Follow-up

Review/merge PR normally, monitor its main-triggered publication and compare canonical /publication.json framework_sha with the merge SHA. Parent performs online viewer acceptance; OSS/Astro catalogue work remains deferred until that passes.

## Read-only reusable snapshot evidence

The latest successful production run 37782082059 prepare log exposes only these non-secret immutable inputs (reference evidence, never hardcoded as deployment defaults):

- content_repository: KiritoKing/llm-obsidian
- publication_branch: publish-snapshots
- content_sha: ce2b8c25eb0cad425964b4087a2043836c60484a
- manifest_sha256: e80e4cc50c0dab43b1c21304f920567f09d81e1dd99f6cce3c2fd60e8ec65cc6
- source_tree_hash: 8985e8dda1568f77d46dba5e79042160e0251a64eb6a13d6a3d5371a7f41f6da

Manual retry, if independently authorized, requires all five immutable inputs, deploy_mode=production-retry, and branch main. Main-push publication resolves accepted content dynamically and needs no manual input. Previous run canonical verification succeeded with build_revision 8a1c21ae935f27413cb4c6b5b06a97ce0df0119798410edab3fe167d2278fc92; this is historical evidence rather than a fresh online measurement.
