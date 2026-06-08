# Handoff: R5 stabilize-build-and-env-validation

Status: done
Owner: hermes
Branch: hermes/R5-stabilize-build-and-env-validation
Last updated: 2026-06-09T01:40:00+0800

## Objective

Stabilize local build/check/validation commands to use Markdown fixture source without Notion API errors. Isolate Notion API calls to explicit production validation commands.

## Completed

- `isLocalContentValidationCommand()` extended: detects missing/invalid credentials for `build`/`dev`, returns true → falls back to local mode
- `tools/validate-notion.mjs` created: explicit Notion API validation (only tool that calls real Notion)
- `package.json` updated: `validate:production`, `validate:production-env` scripts added
- `openspec/specs/build-and-env-validation/spec.md` created (delta spec)
- R5 status → done, R6 blocked_by → []

## R6 is now ready

R6 (`add-e2e-test-layer`) is unblocked — R2, R4, R5 all done.
Recommend creating a worktree and dispatching R6.

## Validation results

- `npx pnpm validate:local` — 0 errors ✓
- `NOTION_TOKEN=xxx NOTION_DATABASE_ID=xxx npx pnpm validate:local` — 0 errors ✓
- `npx pnpm test` — 109/109 tests passed ✓
- `node tools/validate-notion.mjs` — clear error without credentials ✓
- `node tools/validate-notion.mjs --env` — clear error without credentials ✓