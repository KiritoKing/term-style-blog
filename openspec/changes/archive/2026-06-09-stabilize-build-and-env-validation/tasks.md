# Tasks: R05 - Stabilize Build and Environment Validation

## Implementation Tasks

### Task 1: Extend Environment Detection
- [ ] Modify `isLocalContentValidationCommand()` in `src/data/notionContentLoader.ts`
  - [ ] Add detection for `build` and `dev` commands
  - [ ] Add check for missing/invalid Notion credentials
  - [ ] Ensure backward compatibility with existing `check`/`sync` detection

### Task 2: Create Production Validation Tool
- [ ] Create `tools/validate-notion.mjs`
  - [ ] Implement Notion API credential validation
  - [ ] Add `--env-check` mode for environment setup validation
  - [ ] Provide clear error messages for missing/invalid credentials

### Task 3: Update package.json Scripts
- [ ] Add `validate:production` script (requires Notion credentials)
- [ ] Add `validate:production-env` script (requires Notion credentials)
- [ ] Keep `build:local` script for local builds with fallback
- [ ] Document scripts in comments

### Task 4: Update .env.example Documentation
- [ ] Document validation modes
- [ ] Add examples for local vs production usage
- [ ] Clear warnings about credential requirements

### Task 5: Update tasks.yaml
- [ ] Update R5 status to `in_progress`
- [ ] Update R6 blocked_by to remove R5 when complete
- [ ] Add report and handoff files

## Testing Tasks

### Task 6: Test Local Validation
- [ ] Run `pnpm validate:local` without credentials
- [ ] Run `NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid pnpm validate:local`
- [ ] Verify no Notion API errors appear

### Task 7: Test Build Command
- [ ] Run `pnpm build` without credentials
- [ ] Verify clear "Notion not configured" message
- [ ] Verify build succeeds or fails gracefully

### Task 8: Test Production Validation
- [ ] Run `pnpm validate:production` with invalid credentials
- [ ] Run `pnpm validate:production` with valid credentials (if available)
- [ ] Verify clear distinction from local validation

## OpenSpec Tasks

### Task 9: Create OpenSpec Change
- [ ] Create `openspec/changes/R05-stabilize-build-and-env-validation/proposal.md`
- [ ] Create `openspec/changes/R05-stabilize-build-and-env-validation/design.md`
- [ ] Create `openspec/changes/R05-stabilize-build-and-env-validation/tasks.md`
- [ ] Run `openspec validate R05-stabilize-build-and-env-validation --strict`

## Acceptance Verification

### Task 10: Run Acceptance Commands
- [ ] `pnpm validate:local` passes with 0 errors
- [ ] `NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid pnpm validate:local` passes gracefully
- [ ] `pnpm build` passes or shows clear "Notion not configured" message
- [ ] `git diff --check` passes

## Reporting Tasks

### Task 11: Documentation
- [ ] Write report to `.agent/reports/R05-stabilize-build-and-env-validation.md`
- [ ] Write handoff to `.agent/handoffs/R05-stabilize-build-and-env-validation.md`
- [ ] Update `.agent/tasks.yaml` R5 status to `done`