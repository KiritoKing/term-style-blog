# Handoff: B06 manual-preview-deployment-policy

Status: done
Owner: Root accepted; no active writer
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09

## Completed

- Default dispatch is an immutable manual preview with production disabled.
- Manual preview keeps exact snapshot, strict assets, local noindex and real-corpus browser gates, validates Cloudflare preview outputs, writes a non-secret immutable deployment record and reports online acceptance pending.
- Manual policy never fetches the preview URL. Automatic URL verification and production require explicit `true` plus `automatic`; production retry rejects otherwise.
- Resolver and workflow regression suites, project units, Astro checks, YAML/Bash structure, strict OpenSpec and diff checks pass.
- The strict-validated delta is synced to the base spec and archived at `openspec/changes/archive/2026-09-08-manual-preview-deployment-policy/`.

## Review evidence

- RED: 15 pass / 5 expected fail before implementation.
- GREEN: deployment 21/21, Vitest 112/112, Astro 0 diagnostics, workflow 22/22 Bash blocks.
- Full evidence: `.agent/reports/B06-manual-preview-policy.md`.

## Next actions

1. Review the B06 diff together with root's separate `README.md` change.
2. Commit/push using the normal PR path; B06 performed no Git or remote write.
3. Dispatch the intended immutable snapshot, download `preview-deployment-record.json`, and perform human online preview acceptance.
4. Keep both repository policy variables at their fail-closed values until the accepted preview and later production authorization are recorded.

## Risks

- No live Actions, Cloudflare, Access or page response was exercised here. A successful manual workflow means preview deployment succeeded and acceptance is pending; it does not prove the online blog page.
- Automatic mode remains implemented for future use, but is unreachable under current fail-closed repository variables.

Root accepted after independent 21/21 deployment tests and diff/spec review; locks released.
