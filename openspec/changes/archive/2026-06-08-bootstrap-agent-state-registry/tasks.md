## 1. Canonical Task Registry

- [x] 1.1 Create `.agent/tasks.yaml` with registry version, source references, allowed status values, and update metadata.
- [x] 1.2 Seed registry entries for R0 through R19 and R19.0 from `docs/ai-agent-delivery-plan.md`.
- [x] 1.3 Add dispatch metadata to every task entry: id, change name, priority, dependencies, status, owner session, branch, allowed paths, locked paths, relevant specs, required tests, acceptance commands, report path, handoff path, and last updated metadata.
- [x] 1.4 Assign conservative initial statuses and record blocker or unblock conditions for every blocked task.

## 2. Recoverable Handoff Snapshots

- [x] 2.1 Create `.agent/handoffs/supervisor.md` with ready, blocked, review, done, and deferred groups plus the next recommended dispatch decision.
- [x] 2.2 Create `.agent/handoffs/R19.0-bootstrap-agent-state-registry.md` using the `AGENTS.md` task handoff template.

## 3. Reviewable Task Report

- [x] 3.1 Create `.agent/reports/R19.0-bootstrap-agent-state-registry.md` using the `AGENTS.md` report template.
- [x] 3.2 Record validation commands, command results, OpenSpec impact, risks, and follow-ups in the R19.0 report.
- [x] 3.3 If validation fails or implementation is blocked, record the failed command, blocker, and next action in both the report and task handoff.

## 4. Manual Session Boundary

- [x] 4.1 Keep implementation scoped to `.agent/**` and the R19.0 OpenSpec change artifacts unless a blocker is reported.
- [x] 4.2 Verify the implementation does not add runtime Astro behavior, package dependencies, schedulers, autonomous thread spawning, `.codex/skills`, `.trae`, or other coding-agent tool directories.

## 5. Validation Gate

- [x] 5.1 Parse `.agent/tasks.yaml` as YAML without syntax errors.
- [x] 5.2 Run `openspec validate bootstrap-agent-state-registry --strict`.
- [x] 5.3 Run `git diff --check` and record the result in the R19.0 report.
