## Why

The project now requires agent work state to survive context resets, thread changes, and manual Codex session handoffs. R19.0 bootstraps the minimal repository-backed registry so future supervisor, worker, and reviewer sessions can coordinate from files instead of chat history.

## What Changes

- Add a versioned `.agent/tasks.yaml` registry seeded from `docs/ai-agent-delivery-plan.md`.
- Add the initial supervisor handoff snapshot at `.agent/handoffs/supervisor.md`.
- Add the R19.0 worker report and handoff files so this bootstrap task is recoverable and reviewable.
- Define status, dependency, file lock, allowed path, acceptance command, report, and handoff fields for every tracked task.
- Do not introduce any runtime application behavior, package dependency, autonomous scheduler, or external multi-agent framework.

## Capabilities

### New Capabilities

- `agent-state-registry`: Repository-backed task registry and handoff state for Codex supervisor, worker, and reviewer sessions.

### Modified Capabilities

- None.

## Impact

- Affected files:
  - `.agent/tasks.yaml`
  - `.agent/handoffs/supervisor.md`
  - `.agent/handoffs/R19.0-bootstrap-agent-state-registry.md`
  - `.agent/reports/R19.0-bootstrap-agent-state-registry.md`
- No changes to Astro runtime pages, content loading, styles, package dependencies, or build configuration.
- Future work can use the registry to decide which tasks are ready, blocked, in review, or done.

## Test Impact

- Validate that `.agent/tasks.yaml` parses as YAML.
- Validate that required R19.0 report and handoff files exist and reference the acceptance evidence.
- Run `openspec validate bootstrap-agent-state-registry --strict` before implementation.
