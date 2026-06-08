## Context

`AGENTS.md` already defines a repository-backed handoff protocol, but the required `.agent/tasks.yaml` registry does not exist yet. `docs/ai-agent-delivery-plan.md` contains the source inventory for R0-R19, including priorities, dependencies, validation expectations, and the control-plane model.

Current constraints:

- Work state MUST live in repository files, not chat context.
- Codex sessions are started manually by the user; this change MUST NOT add autonomous scheduling or a new multi-agent framework.
- Codex skills stay in `.agents/skills`; this change MUST NOT introduce `.codex/skills`, Trae, or other coding-agent tool directories.
- Existing OpenSpec product capabilities do not cover agent state, so this change adds a new `agent-state-registry` capability.

## Goals / Non-Goals

**Goals:**

- Bootstrap `.agent/tasks.yaml` from the R0-R19 plan.
- Store dependency, status, allowed path, lock, acceptance, report, and handoff metadata for each tracked task.
- Provide a supervisor handoff snapshot that a new session can read before dispatching workers.
- Provide R19.0 report and handoff files for this bootstrap task.
- Make validation evidence explicit and repeatable.

**Non-Goals:**

- No runtime Astro UI, route, content, or style changes.
- No package dependency, CI job, or script runner additions.
- No autonomous thread spawning, background scheduler, or external agent framework.
- No attempt to mark unrelated R0-R18 work done without report and validation evidence.

## Decisions

### Use `.agent/tasks.yaml` as the canonical registry

The registry is the single machine-readable file for task scheduling state. YAML is already named in `AGENTS.md`, is easy to review in diffs, and can model nested metadata without adding dependencies.

Alternative considered: a Markdown table. It is easier to read but harder to validate and update safely, so it is not the canonical state file.

### Seed both top-level requirements and R19.0

The registry will include the R0-R19 requirements from `docs/ai-agent-delivery-plan.md` plus the concrete bootstrap subtask `R19.0`. Top-level R19 can stay blocked by its planned dependencies, while R19.0 can be tracked as the immediate bootstrap work.

Alternative considered: only create R19.0. That would satisfy the narrow task but would not give the supervisor enough state to dispatch or block future work.

### Keep statuses conservative

Tasks with unsatisfied dependencies are `blocked`. Tasks with no dependencies and no current report evidence can be `ready`. Completed-but-unarchived OpenSpec changes are not automatically marked `done`; R0 is the task that reconciles that state.

Alternative considered: infer done states from implementation files. That would bypass the report and review evidence required by `AGENTS.md`.

### Use handoff and report Markdown for human recovery

`.agent/handoffs/supervisor.md` summarizes global state, while `.agent/handoffs/R19.0-bootstrap-agent-state-registry.md` and `.agent/reports/R19.0-bootstrap-agent-state-registry.md` capture this specific task. The YAML registry remains canonical for state; Markdown files provide recovery context and evidence.

Alternative considered: store all details only in YAML. That is compact but unpleasant for reviewer handoff and command evidence.

## Risks / Trade-offs

- [Risk] The initial task inventory may become stale as OpenSpec changes are added or archived. -> Mitigation: every supervisor dispatch or review updates `.agent/tasks.yaml` and the supervisor handoff.
- [Risk] YAML structure can drift without a schema validator. -> Mitigation: bootstrap validation must at least parse the YAML and check required files exist; a later task can add a stricter validator.
- [Risk] Statuses may be over-trusted. -> Mitigation: `done` requires acceptance evidence, report completeness, and OpenSpec synchronization or an explicit no-sync note.
- [Risk] R19.0 touches the control plane before R19's full dependencies are complete. -> Mitigation: scope R19.0 to bootstrap state only; leave full dispatch/review automation blocked until R2, R6, and R11 are complete.

## Migration Plan

1. Create `.agent/tasks.yaml` with a `version`, `last_updated`, status constants, and tasks seeded from R0-R19 plus R19.0.
2. Create `.agent/handoffs/supervisor.md` with current ready, blocked, in-review, and done snapshots.
3. Create R19.0 report and handoff files.
4. Validate YAML parsing and OpenSpec strict validation.
5. If validation fails, keep R19.0 out of `done` and record the blocker in the report/handoff.

Rollback is file deletion of the new `.agent` artifacts before downstream sessions rely on them.

## Open Questions

- Should a later change add a strict registry validator script under `scripts/agent/`?
- Should R0 archive the two completed active OpenSpec changes before any P1 work starts?
