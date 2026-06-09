# Design: R05 - Stabilize Build and Environment Validation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Command Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  pnpm validate:local    │  pnpm build:local   │  pnpm build    │
│  (astro check)          │  (astro build)      │  (astro build) │
└───────────┬─────────────┴─────────┬───────────┴───────┬─────────┘
            │                       │                   │
            ▼                       ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Detection                         │
│  isLocalContentValidationCommand()                              │
│  - Detects: check, sync, build (if no valid creds)              │
│  - Returns: boolean                                             │
└─────────────────────────────────────────────────────────────────┘
            │                       │                   │
            ▼                       ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Notion Content Loader                          │
│  notionContentLoader()                                          │
│  - allowEmptyFallback: true for local validation                 │
│  - allowEmptyFallback: false for production build               │
│  - Shows clear warning when using fallback mode                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Extend Environment Detection (`src/data/notionContentLoader.ts`)

```typescript
export const isLocalContentValidationCommand = (): boolean => {
  const localCommands = ['check', 'sync'];
  const isLocalCmd = process.argv.some((arg) => localCommands.includes(arg));
  
  // Also check for build/dev with missing credentials
  const isBuildOrDev = process.argv.some((arg) => 
    arg === 'build' || arg === 'dev'
  );
  const hasValidCredentials = hasRequiredNotionConfig({
    auth: process.env.NOTION_TOKEN,
    data_source_id: process.env.NOTION_DATABASE_ID,
  });
  
  return isLocalCmd || (isBuildOrDev && !hasValidCredentials);
};
```

### 2. Add Production Validation Tool (`tools/validate-notion.mjs`)

```javascript
// tools/validate-notion.mjs
// Explicitly validates Notion credentials and requires valid tokens
```

### 3. Update package.json Scripts

| Script | Purpose | Notion Required |
|--------|---------|-----------------|
| `validate:local` | Type check and Astro validation | No |
| `build:local` | Build with fallback to fixtures | No |
| `build` | Production build | Yes |
| `validate:production` | Test Notion credentials | Yes |
| `validate:production-env` | Check env setup | Yes |

### 4. Environment Variable Handling

- `NOTION_TOKEN` and `NOTION_DATABASE_ID` are required for production builds
- Missing/invalid credentials trigger fallback mode with clear warning
- Production build fails fast with helpful error when credentials missing

## File Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `src/data/notionContentLoader.ts` | Modify | Extend local detection logic |
| `package.json` | Modify | Add new validation scripts |
| `tools/validate-notion.mjs` | Add | Production Notion validator |
| `.env.example` | Update | Document validation modes |

## Testing Strategy

### Unit Tests
- `isLocalContentValidationCommand()` returns correct values for each command
- Missing credentials detection works correctly

### Integration Tests
- `pnpm validate:local` passes without credentials
- `pnpm build` fails gracefully with clear message
- `pnpm validate:production` correctly validates credentials

## Migration Path

1. Update detection logic (backward compatible)
2. Add new scripts (non-breaking)
3. Document new commands in `.env.example`
4. Update existing acceptance commands in `tasks.yaml`