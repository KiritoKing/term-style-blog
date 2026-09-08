# Handoff: B02 integrate-publication-deployment

Status: done
Owner: /root/blog
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09T02:14:41+0800

Objective: Integrate the accepted immutable publication deployment workflow and its validator/tests without executing deployment or changing B01/dist.

Relevant specs: `openspec/changes/integrate-publication-deployment/**`, `openspec/specs/publication-snapshot-source/spec.md`, `openspec/specs/publication-discovery/spec.md`.

Allowed paths: `.github/workflows/deploy-publication.yml`, `.github/workflows/ci.yml`, `scripts/validate-publication-snapshot.mjs`, `tests/validate-publication-snapshot.test.mjs`, `package.json`, B02 OpenSpec and `.agent` files.

Locked/shared paths: B02 owns the listed workflow/script/test/package files until supervisor review.

## Completed

- Proposal, design, delta spec, test design, tasks and registry/handoff were created and strict-validated before copying code.
- Accepted workflow, validator and Node tests were copied from `/tmp/vault-pipeline-20260909/deploy-workflow`.
- `test:deployment` is wired into package scripts, offline CI and the deployment workflow.
- Node tests, JavaScript syntax, workflow YAML/Bash, package references, immutable/pinned input behavior, site modes, OpenSpec and diff checks pass.
- B01 production `dist` stayed unchanged at 417 files and fingerprint `f347d096b25133541e5c81ca9535f07cce78af278d7af0fa64e1ef337fc92c97`.
- Full evidence: `.agent/reports/B02-publication-deployment.md`.

## In progress

None. Files are frozen for independent review and remain uncommitted.

## Blocked by

No local B02 blocker. Live credential/project setup and deployment are intentionally outside this contract.

## Next actions

1. Review the B02 diff and report.
2. Sync/archive `integrate-publication-deployment`, mark B02 done and release locks if accepted.
3. Proceed through an authorized commit/push and the separate Cloudflare credential/manual-preview gates.

## Files changed

- `.github/workflows/deploy-publication.yml`
- `.github/workflows/ci.yml`
- `scripts/validate-publication-snapshot.mjs`
- `tests/validate-publication-snapshot.test.mjs`
- `package.json`
- `openspec/changes/integrate-publication-deployment/**`
- `.agent/tasks.yaml`, this handoff and the B02 report

## Commands and results

- `pnpm test:deployment`: 17 pass.
- `node --check scripts/validate-publication-snapshot.mjs`: pass.
- `pnpm test`: 107 pass.
- `pnpm check`: 0 errors/warnings/hints.
- Production site-mode check: 266 HTML, 54 indexable entrypoints; wrong preview mode rejected.
- Ruby YAML plus `bash -n`: 2 workflows and 27 run blocks pass.
- B02 strict OpenSpec, task YAML and diff checks: pass.

## Risks and open questions

- No live Actions/Cloudflare run has tested external credentials, Pages project configuration, preview URL output or production branch behavior.
- The report discloses two immediately removed `/tmp` output captures created accidentally during a negative validator check; no external state remains.
- The unrelated `tdd-governance` Purpose baseline remains unchanged.

## Supervisor acceptance

Root repeated all 17 deployment tests and production artifact mode verification. Specs synced/archived at `openspec/changes/archive/2026-09-08-integrate-publication-deployment/`. Implementation accepted; live preview/cutover remains blocked by Pages API authorization (read-only request returned 403).
