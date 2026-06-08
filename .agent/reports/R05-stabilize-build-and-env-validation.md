# Report: R5 stabilize-build-and-env-validation

Status: done
Owner: hermes
Branch: hermes/R5-stabilize-build-and-env-validation
Completed: 2026-06-09T01:40:00+0800

## Files changed

| File | Action |
| --- | --- |
| `src/data/notionContentLoader.ts` | modified — `isLocalContentValidationCommand()` extended to detect missing/invalid credentials for build/dev |
| `tools/validate-notion.mjs` | created — explicit Notion API validation tool |
| `package.json` | modified — added `validate:production`, `validate:production-env` scripts |
| `openspec/changes/R05-stabilize-build-and-env-validation/` | created |
| `openspec/changes/R05-stabilize-build-and-env-validation/specs/build-and-env-validation/spec.md` | created |
| `.agent/tasks.yaml` | modified — R5→done, R6 blocked_by updated |

## What was established

1. **Local validation isolation**: `isLocalContentValidationCommand()` now detects missing/invalid credentials and returns true for `build`/`dev` commands without Notion env, preventing Notion API errors.
2. **Explicit production validation**: `pnpm validate:production` and `pnpm validate:production-env` are the ONLY commands that attempt real Notion API calls.
3. **Graceful credential absence**: Placeholder values (`'invalid'`, `'***'`, `'your_notion_token'`, short IDs) are detected and trigger local fallback.
4. **Delta spec**: `openspec/specs/build-and-env-validation/spec.md` documents the new behavior.

## Commands run

```bash
npx pnpm validate:local
# => 0 errors, 1 warning, 8 hints

NOTION_TOKEN=xxx NOTION_DATABASE_ID=xxx npx pnpm validate:local
# => 0 errors, same warning/hints

npx pnpm test
# => 6 test files, 109 tests passed

node tools/validate-notion.mjs --env
# => exits 1 (no credentials), clear error message

node tools/validate-notion.mjs
# => exits 1 (no credentials), clear error message
```

## Unblocked tasks

- **R6** (`add-e2e-test-layer`): now unblocked — R2 and R4 both done, R5 now done
- **R6 can be dispatched immediately**

## Follow-ups

- R6 is ready for dispatch — e2e test layer (Playwright)
- After R6: R7 becomes ready (requires R0–R6 Day 1 baseline gate)