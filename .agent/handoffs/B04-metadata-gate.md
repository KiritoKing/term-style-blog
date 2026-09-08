# Handoff: B04 metadata gate

Status: review
Owner: B04 publisher
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09

Objective: Enforce required public category and summary without historical or
runtime fallbacks.

Relevant specs: `openspec/specs/publication-snapshot-source/spec.md`

Allowed paths: the B04 content model, validator, tests, Deno publisher tool, and
this B04 report/handoff.

Locked/shared paths: `src/lib/publication.ts`, `src/lib/blog-model.ts`,
`src/content.config.ts`, `src/test/**`, `scripts/validate-content.ts`.

Completed:

- Reproduced the real 53-article warning-and-continue defect.
- Added RED tests, removed both metadata fallbacks, tightened runtime schema,
  and added the same Deno exporter gates.
- Inventoried the real corpus without editing it.
- Passed 111 framework tests, Astro check, and 17 Deno tests.

In progress: none.

Blocked by: production content now correctly blocks on
`rog-ally-xbox-x-掌机折腾记录.md` until a human writes category and summary.

Next actions:

1. Source owner reviews the candidate classification in the B04 report and
   updates the article through the authorized source workflow.
2. Root reattests Headless hashes, re-exports, and reruns production validation.
3. Root/B05 continues full generated-route visual acceptance only after the
   metadata gate passes.

Files changed:

- `src/lib/publication.ts`
- `src/lib/blog-model.ts`
- `src/content.config.ts`
- `src/test/publication.test.ts`
- `src/test/blog-markdown.test.ts`
- vault exporter `src/snapshot.ts`, tests, README and reports

Tests added/updated: validator matrix for both statuses, normalizer no-fallback,
and Deno exporter metadata rejection.

Commands run and results: see `.agent/reports/B04-metadata-gate.md`.

Risks: the pre-gate 53-file isolated snapshot contains deficient metadata and
must not be treated as the corrected deployable snapshot.

Open questions: final category/summary wording requires source-owner judgment.
