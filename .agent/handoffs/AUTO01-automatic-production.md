# Handoff AUTO01

Status: done
Owner: none; locks released
Branch: codex/automatic-production-closeout-20260909
Last updated: 2026-09-09

## Completed

Automatic production is active with true/automatic policy. Existing human Access policy is retained; the dedicated Service Auth token authenticates CI preview verification. Token expiry: 2027-09-09.

Real local save and byte-exact restoration each independently emitted a normal Hermes repository_dispatch and reached verified production. Successful runs: 34352329632 and 34352935115. Each verified all 103 normal hosted routes, plus root's 8 live desktop/mobile browser visits per deployment. All 54 source articles are restored to pre-test bytes. No canary remains.

Final production framework: 6c4627697b7e0e7c44376621104b7dc05529c186.
Final content: d1bd7e2ec3b16246a30bcfd756a541d5ea129f7d.
Final deployment: 8d60c430-fa10-4251-b089-aa36969a7398.
Final source tree: 0bfba329bae5273e47017971616a5ba4015e3785d310300480807f0c607b25b1.

## Verification and recovery

43 deployment tests, 112 unit tests, strict real build, 29 browser tests, strict specs and aggregate CodeQL pass. Runtime pnpm omission and timer-based test flake were repaired in PR12/13; failed runs remain recorded. No gate was bypassed. Live no-upload recovery preserved the previous production; actual destructive rollback was not injected.

Source specs synchronized; archive: openspec/changes/archive/2026-09-09-automatic-production-publication.
Report: .agent/reports/AUTO01-automatic-production.md.
Operational instructions: docs/publication-pipeline.md.
Raw evidence: /tmp/term-blog-open-source-audit-20260909/auto-production.

## Next actions

No activation or implementation work remains. Merge this documentation/specification closeout after its checks; this docs-only main update does not deploy. Normal new approved content changes trigger the enabled pipeline. To pause production set PUBLICATION_PRODUCTION_ENABLED=false. Other physical Mac/mobile Sync clients were not separately exercised. No additional plan adjustment proposed.
