# Handoff: R1 reconcile-content-source-contract

Status: done
Owner: codex-goal-019ea808-5b4a-7180-8ebe-dc2dd054f8ba
Branch: codex/R1-reconcile-content-source-contract
Last updated: 2026-06-09T00:33:20+0800

Objective:
Reconcile Notion and Markdown content-layer contracts into one explicit content-source strategy.

Relevant specs:
- `openspec/specs/content-layer-markdown/spec.md`
- `openspec/specs/notion-content-layer/spec.md`
- `openspec/changes/archive/2026-06-09-reconcile-content-source-contract/`

Allowed paths:
- `openspec/changes/**`
- `openspec/specs/content-layer-markdown/spec.md`
- `openspec/specs/notion-content-layer/spec.md`
- `src/content.config.ts`
- `src/lib/**`
- `src/data/**`
- `.agent/**`

Locked/shared paths:
- `src/content.config.ts`
- `openspec/specs/content-layer-markdown/spec.md`
- `openspec/specs/notion-content-layer/spec.md`

Completed:
- Created R1 proposal, design, delta specs, and tasks.
- Declared Notion as the only production content source for the `blog` collection.
- Reclassified Markdown files as non-production examples or future fixtures.
- Added `src/data/contentSource.ts` with source contract constants and Notion property aliases.
- Updated `src/data/blog.ts` to use shared Notion property aliases.
- Added a permissive Notion entry schema to `src/content.config.ts`.
- Added `src/data/notionContentLoader.ts`, wrapping `notionLoader` with an empty-collection fallback only for local validation commands.
- Synced delta specs into main specs.
- Archived the change to `openspec/changes/archive/2026-06-09-reconcile-content-source-contract/`.

In progress:
- None.

Blocked by:
- None.

Next actions:
- Dispatch R2 `establish-tdd-governance`.
- After R2 is done, R3 can start with the content-source contract already resolved.
- R5 should later add production env preflight diagnostics because production builds still require valid Notion credentials.

Files changed:
- `openspec/specs/content-layer-markdown/spec.md`
- `openspec/specs/notion-content-layer/spec.md`
- `openspec/changes/archive/2026-06-09-reconcile-content-source-contract/`
- `src/content.config.ts`
- `src/data/blog.ts`
- `src/data/contentSource.ts`
- `src/data/notionContentLoader.ts`
- `.agent/tasks.yaml`
- `.agent/reports/R1-reconcile-content-source-contract.md`
- `.agent/handoffs/R1-reconcile-content-source-contract.md`
- `.agent/handoffs/supervisor.md`

Tests added/updated:
- No executable tests added because the test harness is not established yet.
- OpenSpec scenarios added/updated for source contract behavior.

Commands run:
- `openspec validate reconcile-content-source-contract --strict`
- `openspec validate notion-content-layer --strict`
- `openspec validate content-layer-markdown --strict`
- `openspec validate --all --strict`
- `corepack pnpm exec tsc --noEmit`
- `corepack pnpm astro check`
- `corepack pnpm build`
- `openspec list --json`
- `git diff --check`
- `ruby -e 'require "yaml"; YAML.load_file(".agent/tasks.yaml")'`

Command results:
- R1 change validation passed before archive.
- Main spec validation passed after sync.
- Full OpenSpec validation passed after archive with 21/21 items.
- `astro check` passed with 0 errors, 1 warning, and 7 hints.
- `build` failed with Notion `API token is invalid`, confirming production build does not use the empty validation fallback.
- `git diff --check` passed.
- `.agent/tasks.yaml` parses as YAML.

Risks:
- Production build remains credential-dependent until R5 adds clearer env validation.
- R3 scope should account for the empty local-validation fallback already introduced in R1.

Open questions:
- Should R3 be narrowed to fixtures/mock content data and harness assertions now that R1 owns the minimal empty validation fallback?
