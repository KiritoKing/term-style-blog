# Handoff: DEMO01 static-only binding review correction

Task ID: DEMO01
Owner/session: codex-cloud-static-binding-review
Status: local implementation and verification complete; remote evidence pending
Branch: feat/public-theme-demo
Last updated: 2026-10-09

Objective: close PR25 review4228652577 within the existing isolated static demo contract.
Relevant specs: openspec/specs/public-theme-demo/spec.md; openspec/specs/publication-deployment/spec.md; openspec/specs/ci-workflow-roles/spec.md; openspec/changes/archive/2026-10-09-public-theme-demo.
Allowed paths: scripts/public-demo/control.mjs; tests/deployment/public-demo.test.mjs; bounded .agent state/report/handoff.
Locked/shared paths: released after local checks.

Completed: verified open/unmerged PR head2cb7dd1 and official 13-map schema; preserved ready status; reproduced four missed maps; replaced partial regex with explicit fields; 26 direct regressions, 122 unit, 82 deployment, type check, both synthetic builds/full Chromium suites and 33 strict specs passed.
In progress: exact-commit CI and existing isolated public demo acceptance after push, recorded in PR/external delivery evidence.
Blocked by: none locally.
Next actions: inspect controlled Actions results for the new SHA; stop and report any real project-contract mismatch without changing bindings or permissions. No production/merge/Access/credential operation authorized.

Files changed: see .agent/reports/DEMO01-static-bindings-review.md.
Tests added/updated: 13 binding-map refusal cases in both environments plus benign metadata/empty-map reuse.
Commands/results: see report; template Chromium33pass/12skip, owner32pass/13skip, Chromium only.
Risks: no data-leak evidence; explicit schema list needs maintenance if the official API evolves.
Open questions: none. Previous DEP01 closure bookkeeping in three dirty files must remain untouched and outside this commit.
