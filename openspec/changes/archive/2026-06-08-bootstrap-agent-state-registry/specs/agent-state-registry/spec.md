## ADDED Requirements

### Requirement: Canonical Task Registry
The repository SHALL provide `.agent/tasks.yaml` as the canonical machine-readable registry for agent task state.

#### Scenario: Registry is bootstrapped from the delivery plan
- **WHEN** R19.0 implementation is complete
- **THEN** `.agent/tasks.yaml` contains entries for the planned R0 through R19 requirements and the concrete R19.0 bootstrap task

#### Scenario: Registry entries expose dispatch metadata
- **WHEN** a supervisor session reads any task entry
- **THEN** the entry includes id, change name, priority, dependencies, status, owner session, branch, allowed paths, locked paths, relevant specs, required tests, acceptance commands, report path, handoff path, and last updated metadata

#### Scenario: Blocked tasks explain their unblock condition
- **WHEN** a task status is `blocked`
- **THEN** the registry entry records the blocking dependencies or condition and the condition required to move it to `ready`

### Requirement: Recoverable Handoff Snapshots
The repository SHALL provide Markdown handoff snapshots under `.agent/handoffs/` for supervisor and task-level recovery.

#### Scenario: Supervisor handoff summarizes global state
- **WHEN** a new supervisor session starts after R19.0
- **THEN** `.agent/handoffs/supervisor.md` lists current ready, blocked, review, done, and deferred task groups plus the next recommended dispatch decision

#### Scenario: Task handoff follows the required template
- **WHEN** a worker or reviewer resumes R19.0
- **THEN** `.agent/handoffs/R19.0-bootstrap-agent-state-registry.md` includes status, owner, branch, objective, relevant specs, allowed paths, locked paths, completed work, blockers, next actions, changed files, commands, risks, and open questions

### Requirement: Reviewable Task Report
The repository SHALL provide a task report for R19.0 under `.agent/reports/` with validation evidence.

#### Scenario: Report captures execution evidence
- **WHEN** R19.0 is ready for review
- **THEN** `.agent/reports/R19.0-bootstrap-agent-state-registry.md` lists status, files changed, tests or validations, commands run, command results, OpenSpec impact, risks, and follow-ups

#### Scenario: Failed validation is recorded before stopping
- **WHEN** R19.0 validation fails or is blocked
- **THEN** the report and task handoff record the failed command, result, blocking reason, and next action instead of relying on chat-only status

### Requirement: Manual Session Boundary
The agent state registry MUST preserve the repository's manual Codex session model and tool directory constraints.

#### Scenario: Bootstrap does not add autonomous orchestration
- **WHEN** R19.0 is implemented
- **THEN** it does not create background schedulers, autonomous thread spawning, external multi-agent framework dependencies, or runtime application behavior

#### Scenario: Bootstrap keeps approved tool directories
- **WHEN** R19.0 is implemented
- **THEN** it uses `.agent/` for work state, keeps Codex skills under `.agents/skills`, and does not create `.codex/skills`, `.trae`, or other coding-agent tool directories

### Requirement: Validation Gate
The bootstrap implementation SHALL include repeatable validation for the registry and OpenSpec proposal.

#### Scenario: YAML registry parses
- **WHEN** R19.0 implementation is complete
- **THEN** an acceptance command parses `.agent/tasks.yaml` as YAML without syntax errors

#### Scenario: OpenSpec change validates
- **WHEN** R19.0 proposal artifacts are complete
- **THEN** `openspec validate bootstrap-agent-state-registry --strict` passes
