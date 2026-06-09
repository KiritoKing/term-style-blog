# Proposal: R3 Create Test Harness and Fixtures

## Change ID
`R03-create-test-harness-and-fixtures`

## Status
Proposed

## Why Changes

The repository needs a reliable test harness that enables local development and CI validation without requiring real Notion credentials. Currently, commands like `pnpm astro check` and `pnpm build` fail when `NOTION_TOKEN` is missing or invalid, blocking local development and CI pipelines. This change establishes a Markdown fixture source and environment mock strategy to decouple local validation from Notion API availability.

## What Changes

1. **Create Markdown fixture source** at `src/fixtures/blog/` with realistic test posts
2. **Add environment mock utilities** to detect validation context and inject fixture data
3. **Define fixture validation harness** that verifies fixture structure without Notion API calls
4. **Update `.env.example`** to document local validation behavior with Notion credentials
5. **Add `validate:local` script** that runs checks without Notion dependencies

## Capabilities

### New Capabilities

- **`markdown-fixture-source`**: Provides local Markdown files as test fixtures that mirror the Notion content schema
- **`env-mock-detection`**: Utilities to detect whether the current command context should use fixtures vs. production Notion
- **`fixture-validation-harness`**: Scripts and checks that validate fixture integrity without network calls

### Modified Capabilities

- **None**

## Impact

- **Positive**: Local development and CI can run validation commands without Notion credentials
- **Positive**: Test fixtures provide stable, deterministic test data
- **Positive**: Fixture validation is fast and network-independent
- **Risk**: Fixtures must be kept in sync with Notion schema changes (mitigated by fixture validation tests)

## Test Impact

- **Unit tests**: Fixtures validate the content schema structure
- **Integration tests**: `validate:local` command uses fixtures without Notion
- **Regression**: Ensure Notion-specific tests only run in production validation mode

## Acceptance Criteria

1. `pnpm validate:local` runs without `NOTION_TOKEN` or `NOTION_DATABASE_ID`
2. `env NOTION_TOKEN=*** NOTION_DATABASE_ID=invalid pnpm validate:local` succeeds
3. Markdown fixtures in `src/fixtures/blog/` conform to the Notion content schema
4. No Notion API calls are made during local validation