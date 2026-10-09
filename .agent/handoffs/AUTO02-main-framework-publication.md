# Handoff: AUTO02 main-framework-publication

Status: review
Owner: codex-cloud-main-publication
Branch: feat/main-publication-autodeploy
Last updated: 2026-10-09
Baseline: 79737bce33fe2d53846187c660a8395c6b667c47

Objective: Publish owner main updates with revalidated already-published immutable content; draft PR before merge.
Relevant specs: publication-deployment, ci-workflow-roles.
Allowed paths/locks: AUTO02 registry entry; tests/e2e included for the discovered production/demo gate defect.
Completed: implementation; RED/GREEN deployment regressions; 53 deployment / 112 unit / 31 Chromium tests; real-corpus image acceptance passed against synthetic public build; type/build/actionlint/YAML/Bash checks.
In progress: feature commit, draft PR, exact-head CI, spec sync/archive and final writeback.
Blocked by: no implementation blocker. Actual production is untouched; deployment proof awaits authorized merge and normal main workflow.
Next actions: finish PR/CI, archive completed change, release locks; parent reviews merge then verifies canonical metadata and viewer.
Risks: canonical metadata required; publication branch ahead of live reference causes safe stale rejection; default false/manual is retained. No new credentials/permissions/dependencies. No direct main push or manual production dispatch.
Report: .agent/reports/AUTO02-main-framework-publication.md
