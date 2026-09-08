# Report: B07 preserve-exporter-v1-tree-hash

Status: pass; accepted by Root
Owner: /root/publisher
Branch: codex/publication-live-validation-fix
Baseline: `817bf2d6c4b1482b4f0c9530ee2fe0bef79ea7bb`
Last updated: 2026-09-09

## Changes

- Fixed the Node snapshot consumer to globally sort discovered Markdown files by relative path after recursive traversal. This matches the producer when both a prefix file and a same-prefix directory exist.
- Fixed schema-v1 tree-hash reconstruction to use the established exporter property order `slug,status,title,path,bytes,sha256`. The producer and all existing snapshot hashes remain unchanged.
- Updated hand-built test snapshots to use the v1 order instead of mirroring the former consumer defect.
- Added `tests/fixtures/publication-exporter-v1`, produced by actually running the checked-in Deno exporter against four synthetic articles. It covers `publish` and `published`, Unicode path/title/slug, nested paths, and the global-order edge `a.md` plus `a/child.md`.
- Added provenance with Deno 2.7.5, schema version 1, and hashes of `src/exporter.ts`, `src/snapshot.ts`, `main.ts`, and `deno.lock`.
- Added malformed file-hash regression while retaining byte, file-set, metadata, immutable-input and B06 manual-preview policy rejection tests.
- Synced the strict delta into the base specification and archived it as `2026-09-08-preserve-exporter-v1-tree-hash` after all tasks passed.

Implementation hashes:

- Node consumer: `ddc0393521b80c8d02943958ebd7b68c10dd07a58a721e5b9b5f66c005618371`
- Node tests: `1d2b2d80e30f868e57c81e821f1c8342a17ab338bf6a9ca013065698655a733c`
- Synthetic manifest: `c5b9138f9038af03e1f17f21bc9a0632f67e8adcf01cd2f2eb6839b9b1629637`
- Synthetic tree: `14679cfe4d6bae9e72704f2bd9dbe8109999f05be3e673a1b500a557949c3bf1`

Producer hashes preserved and matching fixture provenance:

- `src/exporter.ts`: `00dd6237524286b8fd6ac9e84151f23063f46444b45861695310b9033ce22d03`
- `src/snapshot.ts`: `24ea9b6382efc7a3d2325970bad0a7703a9030ad427af82afc24dda7233439f0`
- `main.ts`: `4dd8162ef938ea360c700079b7b1f71d23b741dd4f4651304734963dbb572e51`
- `deno.lock`: `6c52590e81c79cbf66aa06afee3c603d718a40484ef3f6b157e6e5d226eef5d3`

## Verification

- OpenSpec proposal, design, test strategy, delta and tasks were written and `openspec validate preserve-exporter-v1-tree-hash --strict` passed before implementation.
- Actual exporter generation returned 4 files, manifest SHA-256 `c5b9138f...`, and tree hash `14679cfe...`; its manifest field/path order is asserted directly by the Node suite.
- RED: 21 tests passed and 2 failed. The golden failed `FILE_SET_MISMATCH`, exposing non-global traversal order; the v1-ordered hand-built snapshot failed `TREE_HASH_MISMATCH`, reproducing the CI diagnosis.
- GREEN: `pnpm test:deployment` passes 23/23, including the unchanged B06 default/manual/automatic production policy tests and all fail-closed snapshot cases.
- `pnpm test` passes 112/112 across 9 Vitest files.
- `pnpm check` validates the framework content schema and Astro types with 0 errors, warnings or hints.
- `node --check scripts/validate-publication-snapshot.mjs`, registry YAML parsing, strict OpenSpec and `git diff --check` pass.
- Read-only GitHub download confirmed exact commit `524b6709c4c89448dde38b90bbba9bc291ebbb10`. Consumer validation returned manifest `047cfc5b1dbdbfc597b0f61b6b9d60958cbb5bc5b237518d486b6e317441f6d6`, tree `4daf6157fd330a2e74332aaed97c03088a358d0887a5b513d85529766eac3261`, 54 files, 4 `publish`, and 50 `published`.
- Real content stayed only under `/tmp/vault-pipeline-20260909/v1-compatibility`; it was never printed, copied into the fixture, or added to Git.

## Remaining integration

- Root should review the bounded consumer/test/spec diff, then perform the authorized commit/push and a fresh immutable dispatch.
- The real 54-file validation proves consumer compatibility locally; it does not claim a successful Actions, Cloudflare or online preview run.
- Production remains false/manual under B06. No workflow policy, exporter, vault source, credential, Git remote, deployment or service state changed in B07.


## Root acceptance

Root independently inspected the producer-generated synthetic fixture and bounded diff, reran 23/23 deployment tests, and validated the exact failed 54-file snapshot with its original immutable manifest and tree hashes. The consumer accepts it without changing content, producer or hashes. Diff check passed. B07 is done and locks released; live CI/deployment acceptance remains the next distinct gate.
