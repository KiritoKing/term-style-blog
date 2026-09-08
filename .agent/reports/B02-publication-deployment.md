# Report: B02 integrate-publication-deployment

Status: local pass; ready for independent review
Owner: /root/blog
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09T02:14:41+0800

## Changes

- Added `.github/workflows/deploy-publication.yml` from the accepted staging implementation. It accepts the fixed Hermes `content_published_changed` dispatch and explicit manual preview/production retry, checks out immutable framework and content SHAs, validates the manifest and source, verifies/deploys preview first, separately rebuilds production metadata, rechecks freshness, serializes production by Pages project and records credential-free deployment identifiers.
- Added dependency-free `scripts/validate-publication-snapshot.mjs`. It validates the fixed publication repository/branch, full immutable SHAs and hashes, SHA-bound dispatch id, exact manifest and Markdown file set, bytes/hashes/tree hash/frontmatter, both `publish` and `published`, unique portable slugs, and generated preview/production indexing policy. It rejects drafts, wrong targets, conflicts, secrets, symlinks, extra files and local media.
- Added `tests/validate-publication-snapshot.test.mjs` and package script `test:deployment`. Added explicit `pnpm test:deployment` steps to both offline CI and the deployment workflow so the Node suite cannot be skipped by Vitest discovery.
- Added B02 OpenSpec proposal, design, delta specification, test design and completed task list before integration. B01 implementation and archived change were not rewritten.

Final integrated file hashes:

- workflow: `a9de27d2020537cbaca2a0bf5c851562354cc7a7f5a02475024a0f56b3e96c91`
- validator: `d1c387c82f092f4c386baa9d2c2e031a96edc456d6b811c2ba28adff60a76f50`
- tests: `f5f1fc206316b2bbb02bb34e1b4c2aca15b5267742afa6e020be8d51fe45e23d`

The validator remains byte-identical to accepted staging. Workflow/test hashes differ only for the explicit package-suite wiring and its assertion.

## Verification

- `pnpm test:deployment` — pass: 17 tests, 0 failures. Coverage includes valid mixed `publish`/`published`, manifest/file tampering, extra/missing/empty sets, draft, secret metadata, Markdown/Obsidian local media, fixed input normalization, mutable/mismatched input rejection, preview/production mode separation, pinned workflow dependencies, production ordering/serialization/read-only permissions, no credential output, and package/CI/workflow wiring.
- `node --check scripts/validate-publication-snapshot.mjs` — pass.
- `pnpm test` — pass: existing 107 Vitest tests, with no build or Notion request.
- `pnpm check` — pass; it did not rebuild `dist`.
- `node scripts/validate-publication-snapshot.mjs site --root dist --mode production` — pass against the frozen B01 production artifact: 266 HTML files, 54 indexable entrypoints checked.
- The same production artifact with `--mode preview` — expected `SITE_MODE_MISMATCH`; this proves production/preview policy is bidirectional and a preview `noindex` artifact also fails production mode in the Node suite.
- Ruby Psych parsed `.github/workflows/ci.yml` and `.github/workflows/deploy-publication.yml`; `bash -n` passed all 27 extracted `run` blocks (7 offline CI, 20 deployment).
- Static wiring check found the package test script and both workflow invocations, with all referenced files present. All 12 deployment `uses:` references are full 40-character commit SHAs. Workflow permissions remain `contents: read`, and tests reject secret names in command output plus secret-like deployment-record fields.
- `openspec validate integrate-publication-deployment --strict` — pass.
- `.agent/tasks.yaml` Ruby YAML parse — pass.
- `git diff --check` — pass.
- Frozen `dist` fingerprint before and after B02 checks: 417 files, SHA-256 `f347d096b25133541e5c81ca9535f07cce78af278d7af0fa64e1ef337fc92c97`; B02 did not rebuild or rewrite it.

Primary references checked for the implemented behavior:

- [GitHub repository dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#repository_dispatch)
- [GitHub workflow and job concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [Cloudflare Pages direct upload from CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
- [Cloudflare Pages preview branch deployment](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Wrangler Action 4.0.0](https://github.com/cloudflare/wrangler-action/releases/tag/v4.0.0)
- [Wrangler 4.130.0](https://github.com/cloudflare/workers-sdk/releases/tag/wrangler%404.130.0)

## Scope and D2 evidence

No Git commit, push, merge, dispatch, deployment, credential read/write, Cloudflare operation or vault-source mutation occurred. All deliverables are under `/tmp/vault-pipeline-20260909/blog-worktree`.

One validation command accidentally created two transient capture files at `/tmp/b02-preview-out` and `/tmp/b02-preview-err`, outside the allowed worktree. They contained only the local validator's expected JSON failure, were immediately and exactly removed, and caused no repository, vault, credential, remote or live-service change. This is disclosed as a local scope deviation; there is no remaining external artifact.

## OpenSpec impact

Active change `integrate-publication-deployment` adds the `publication-deployment` capability. It remains active for supervisor review and should be synchronized/archived only after acceptance. The unrelated legacy `tdd-governance` Purpose defect is unchanged.

## Remaining integration

- Supervisor: review the frozen B02 files, accept the task, sync/archive its OpenSpec delta, mark B02 done and release locks.
- Authorized operator: commit/push through the normal review path, configure/verify `VAULT_CONTENTS_READ_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PAGES_PROJECT` and the `production` environment, then run the first manual preview using a real immutable snapshot.
- Before any production cutover, verify the preview URL and Cloudflare project/production-branch setup, disable competing deployment sources, record rollback state, and obtain the required authorization. No live workflow behavior has been claimed here.
