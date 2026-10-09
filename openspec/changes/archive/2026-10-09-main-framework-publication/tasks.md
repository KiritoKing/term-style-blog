## 1. Test first

- [x] 1.1 Add canonical production reference and full snapshot/tamper/missing regressions using injected responses and exporter fixtures.
- [x] 1.2 Add main push policy, deleted/non-main/fork/PR and missing immutable input regressions.
- [x] 1.3 Add workflow boundary, least-privilege and actual temporary-git freshness regressions; capture RED.

## 2. Implementation

- [x] 2.1 Resolve validated published reference and derive verified immutable snapshot inputs for push only.
- [x] 2.2 Add owned main trigger and retain existing event/manual policy and production acceptance protections.
- [x] 2.3 Recheck freshness immediately before serialized upload.

## 3. Acceptance and delivery

- [x] 3.1 Run deployment/unit suites, type check, fixture build, YAML/shell and OpenSpec validation.
- [x] 3.2 Update operational docs, sync/archive specs and write report/handoff.
- [x] 3.3 Push isolated feature branch, create draft PR and verify exact-head CI; do not merge or deploy.
