# build-and-env-validation

## Overview

Stabilize local build/check/validation commands to use Markdown fixture source and fail gracefully without Notion credentials. Explicit Notion API validation is isolated to dedicated production commands.

## ADDED Requirements

### Requirement: Local validation must not require Notion

Local validation commands (`pnpm validate:local`, `pnpm build:local`, `pnpm dev`) must work without `NOTION_TOKEN` or `NOTION_DATABASE_ID`. They must:
- Use Markdown fixture source as content source
- Not attempt Notion API calls
- Not fail with Notion auth/API errors
- Pass `astro check` with 0 errors

### Requirement: Explicit production validation for Notion

Any command that reads from real Notion must be clearly labeled as production validation:
- `pnpm validate:production` — full Notion API connectivity check
- `pnpm validate:production-env` — env var presence check only

These commands must:
- Require valid `NOTION_TOKEN` and `NOTION_DATABASE_ID`
- Exit with clear error messages for missing or invalid credentials
- Be the ONLY commands that attempt real Notion API calls

### Requirement: Graceful credential absence detection

`isLocalContentValidationCommand()` must detect when Notion credentials are:
- Completely missing (env vars undefined)
- Placeholder values: `'invalid'`, `'***'`, `'your_notion_token'`, `'your_notion_database_id'`
- Obviously short values (Notion IDs are 32 chars)

When any of the above are detected for `build` or `dev` commands, the system must fall back to local validation mode (Markdown fixture source) rather than failing with Notion API errors.

---

## MODIFIED Behaviors

### Modified: `pnpm build` behavior without Notion credentials

**BEFORE**: `pnpm build` would fail with Notion `API token is invalid` error.
**AFTER**: `pnpm build` (without credentials) now falls back to local validation mode and builds successfully with Markdown fixture source. Users are not blocked by missing Notion credentials during local development.

### Modified: `isLocalContentValidationCommand()` logic

**BEFORE**: Only returned true for `check` and `sync` commands.
**AFTER**: Also returns true for `build` and `dev` commands when Notion credentials are missing or appear to be placeholders.

---

## ADDED Scenarios

#### Scenario: Build without Notion credentials

**WHEN** `pnpm build` is run without `NOTION_TOKEN` or with placeholder credentials
**THEN** `isLocalContentValidationCommand()` returns true
**AND** Content layer uses Markdown fixture source
**AND** Build completes with 0 errors
**AND** No Notion API calls are made

#### Scenario: Production validation with valid credentials

**WHEN** `pnpm validate:production` is run with valid `NOTION_TOKEN` and `NOTION_DATABASE_ID`
**THEN** Tool attempts real Notion API call
**AND** Returns success if Notion database is accessible
**AND** Returns clear error if credentials are invalid

#### Scenario: Production validation with missing credentials

**WHEN** `pnpm validate:production` is run without valid credentials
**THEN** Tool exits with code 1
**AND** Prints clear error message indicating which credentials are missing/invalid
**AND** No Notion API error is shown to the user