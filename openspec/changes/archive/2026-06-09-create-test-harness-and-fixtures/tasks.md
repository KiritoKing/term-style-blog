# Tasks: R3 Create Test Harness and Fixtures

## Implementation Tasks

- [ ] 3.1 Create `src/fixtures/blog/` directory with at least 3 Markdown fixture posts
- [ ] 3.2 Create `src/fixtures/schema.ts` with Zod schema for fixture validation
- [ ] 3.3 Create `src/fixtures/index.ts` with fixture loading utilities
- [ ] 3.4 Create `src/test/env-mock.ts` with environment detection utilities
- [ ] 3.5 Add `validate:local` script to `package.json`
- [ ] 3.6 Update `.env.example` with local validation documentation

## Test Tasks

- [ ] 3.7 Add Vitest configuration for fixture tests
- [ ] 3.8 Create `src/test/fixtures.test.ts` for fixture schema validation
- [ ] 3.9 Create `src/test/env-mock.test.ts` for env mock utilities
- [ ] 3.10 Add `test:fixtures` script to `package.json`

## OpenSpec Tasks

- [ ] 3.11 Create OpenSpec change directory and artifacts
- [ ] 3.12 Sync delta spec to `openspec/specs/test-harness-and-fixtures/spec.md`
- [ ] 3.13 Update `.agent/tasks.yaml` R3 status

## Validation Tasks

- [ ] 3.14 Run `pnpm validate:local` without credentials
- [ ] 3.15 Run `env NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid pnpm validate:local`
- [ ] 3.16 Verify no Notion API calls during local validation
- [ ] 3.17 Run `pnpm test:fixtures` and verify all tests pass

## Acceptance Commands

```bash
# Validate local without credentials
env NOTION_TOKEN= NOTION_DATABASE_ID= pnpm validate:local

# Validate local with invalid credentials
env NOTION_TOKEN=*** NOTION_DATABASE_ID=invalid pnpm validate:local

# Run fixture tests
pnpm test:fixtures

# Check syntax
git diff --check
```