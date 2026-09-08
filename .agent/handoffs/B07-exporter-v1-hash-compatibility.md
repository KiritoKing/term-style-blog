# Handoff: B07 preserve-exporter-v1-tree-hash

Status: done
Owner: /root/publisher
Branch: codex/publication-live-validation-fix
Last updated: 2026-09-09

## Completed

- Consumer now uses the exporter-v1 global path and property insertion order.
- Actual Deno exporter synthetic golden is committed under `tests/fixtures/publication-exporter-v1` with provenance.
- RED separated discovery-order and tree-hash-order failures; GREEN is 23/23.
- Exact immutable 54-file content snapshot validates with the contract hashes.
- Producer hashes and B06 fail-closed deployment policy are unchanged.
- The strict delta is synced and archived at `openspec/changes/archive/2026-09-08-preserve-exporter-v1-tree-hash/`.

## Evidence

- RED: 21 pass / 2 expected fail (`FILE_SET_MISMATCH`, `TREE_HASH_MISMATCH`).
- GREEN: deployment 23/23; Vitest 112/112; Astro check clean; strict OpenSpec and diff check pass.
- Exact snapshot: content `524b6709...`, manifest `047cfc5b...`, tree `4daf6157...`, 54 files.
- Full report: `.agent/reports/B07-exporter-v1-hash-compatibility.md`.

## Next actions

1. Review the two-line consumer behavior repair plus golden/test/spec artifacts.
2. Commit and push through the existing PR branch.
3. Rerun the exact immutable dispatch; expect snapshot validation to pass before the normal strict preview build.
4. Keep production variables false/manual and evaluate the deployed preview through the existing human acceptance gate.

No remote mutation, commit, push, merge, deploy, vault source edit or exporter edit occurred.

Root accepted after independent 23/23 tests and exact failed immutable snapshot validation; locks released.
