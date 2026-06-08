# Handoff: R2 establish-tdd-governance

Status: done
Owner: hermes
Branch: hermes/R2-establish-tdd-governance
Last updated: 2026-06-09T00:55:00+0800

## Objective

Add TDD governance rules to AGENTS.md and OpenSpec specs so every change must include test design and test tasks, and local validation uses Markdown fixture source without Notion.

## Relevant specs

- `openspec/specs/tdd-governance/spec.md` (new)
- `AGENTS.md` (`### TDD 约束` section, new)

## Completed

- R2 OpenSpec change directory created with proposal.md, design.md, tasks.md, specs/tdd-governance/spec.md
- `openspec/specs/tdd-governance/spec.md` published (5 requirements + 3 scenarios)
- `AGENTS.md` updated with `### TDD 约束` (6 bullet points)
- `.agent/tasks.yaml` updated: R2 → done, R3 unblocked
- `ruby -e 'require "yaml"; YAML.load_file(".agent/tasks.yaml")'` passes
- `git diff --check` passes

## Next

- **R3** is now ready for dispatch (R1 + R2 both done)
- R3: `create-test-harness-and-fixtures` — establish Markdown fixture source and env mocks
- After R3: R4 (`add-vitest-unit-layer`) and R5 (`stabilize-build`) become ready
- After R4 + R5: R6 (`add-ci-quality-gates`) becomes ready