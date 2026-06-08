# Proposal: R05 - Stabilize Build and Environment Validation

## Problem Statement

The current build and validation system has a critical flaw: local development commands like `pnpm build` attempt to connect to Notion API even when credentials are missing or invalid. This breaks local development and CI workflows that expect the system to gracefully fall back to Markdown fixtures.

### Current Behavior

1. `pnpm validate:local` (which is `astro check`) correctly uses `isLocalContentValidationCommand()` to detect `check` command and enables empty fallback
2. `pnpm build` fails with Notion API error "API token is invalid" because it doesn't enable fallback mode
3. No explicit command exists to validate production Notion credentials

### Impact

- Local development requires valid Notion credentials
- CI/CD cannot run build validation without real credentials
- No clear distinction between local validation and production validation commands

## Proposed Solution

### 1. Extend Local Validation Detection

Modify `isLocalContentValidationCommand()` to detect more commands:
- `check` (astro check - already supported)
- `sync` (astro sync - already supported)  
- `build` (astro build when NOTION_TOKEN is missing/invalid - NEW)
- `dev` (astro dev when NOTION_TOKEN is missing/invalid - NEW)

### 2. Add Production Validation Command

Add a new command `pnpm validate:production` that explicitly tests Notion credentials and is documented as requiring valid credentials.

### 3. Add Environment Validation Script

Add `pnpm validate:production-env` script that validates Notion credentials before attempting any operations that require them.

### 4. Update package.json Scripts

```json
{
  "scripts": {
    "build": "astro build",
    "build:local": "astro build",
    "validate:local": "astro check",
    "validate:production": "node tools/validate-notion.mjs",
    "validate:production-env": "node tools/validate-notion.mjs --env-check"
  }
}
```

## Success Criteria

1. `pnpm validate:local` passes with 0 errors (uses Markdown fixture or empty collection)
2. `NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid pnpm validate:local` passes gracefully
3. `pnpm build` passes or fails with clear "Notion not configured" message
4. `pnpm validate:production` is clearly labeled as requiring Notion credentials
5. Environment validation detects invalid credentials early with helpful error message

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing R3 fixtures | Keep fixture validation as separate `pnpm test:fixtures` |
| Adding complexity to build process | Keep changes minimal, only add necessary detection |
| Production builds silently using fixtures | Add clear warning when using fallback mode |