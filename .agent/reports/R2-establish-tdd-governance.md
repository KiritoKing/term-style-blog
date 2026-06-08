# Report: R2 establish-tdd-governance

Status: done
Owner: hermes
Branch: hermes/R2-establish-tdd-governance
Completed: 2026-06-09T00:55:00+0800

## Files changed

| File | Action |
| --- | --- |
| `openspec/changes/R02-establish-tdd-governance/proposal.md` | created |
| `openspec/changes/R02-establish-tdd-governance/design.md` | created |
| `openspec/changes/R02-establish-tdd-governance/specs/tdd-governance/spec.md` | created |
| `openspec/changes/R02-establish-tdd-governance/tasks.md` | created |
| `openspec/specs/tdd-governance/spec.md` | created |
| `AGENTS.md` | modified — added TDD 约束节 |
| `.agent/tasks.yaml` | modified — R2 → done, R3 unblocked |

## Commands run

```bash
ruby -e 'require "yaml"; YAML.load_file(".agent/tasks.yaml")'
# => ok, no parse errors

git diff --check
# => no errors
```

## OpenSpec impact

- **New spec**: `openspec/specs/tdd-governance/spec.md` — 5 requirements + 3 scenarios
- **New capabilities**: `tdd-governance`, `test-fixture-source`
- **AGENTS.md**: new `### TDD 约束` section with 6 bullet points
- **tasks.yaml**: R2 status `ready` → `done`, R3 status `blocked` → `ready`

## What was established

1. **Test-first principle**: worker must design tests before implementation
2. **Test task must be in tasks.md**: at least 50% coverage of spec requirements
3. **Test layering**: unit / component / e2e / axe_smoke / fixture_validation / openspec_validation
4. **Local validation must use Markdown fixture**: no Notion API calls in local dev/CI
5. **Fixture spec**: location, schema, no external API dependencies
6. **acceptance_commands must be declared**: must be locally reproducible

## Unblocked tasks

- **R3** (`create-test-harness-and-fixtures`): now `ready` — deps R1 + R2 both done
- **R4** (`add-vitest-unit-layer`): still blocked by R3
- **R6**, **R11**, **R19**: still blocked by R3 + other deps

## Follow-ups

- R3 can be dispatched now (both R1 and R2 are done)
- Consider running `pnpm astro check` to verify the project still builds after AGENTS.md change
- No CI gates yet — R6 will add those