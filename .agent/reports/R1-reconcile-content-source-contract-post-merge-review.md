# Post-merge Review: R1 reconcile-content-source-contract

Status: pass

Reviewed at: 2026-06-09T00:43:20+0800
Reviewer: codex supervisor
Base before pull: 4994083
Reviewed head: f9b95ad

Findings:
- [P2] R1 uses an empty local-validation fallback, but invalid local Notion env still triggers a Notion client request before falling back. `env NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid corepack pnpm astro check` passed, but output included `@notionhq/client warn: request fail` and `API token is invalid`. This conflicts with the newly stated supervisor policy that future local tests must use Markdown fixture source and must not attempt to read Notion.
- [P3] The R1 worker handoff reports branch `codex/R1-reconcile-content-source-contract`, while this post-merge review is on `main`. This is expected across worker/supervisor contexts but should be explicit in future reports.

Commands run:
- `git pull --ff-only`
- `openspec list --json`
- `openspec validate --all --strict`
- `ruby -e 'require "yaml"; YAML.load_file(".agent/tasks.yaml")'`
- `git diff --check`
- `corepack pnpm exec tsc --noEmit`
- `env -u NOTION_TOKEN -u NOTION_DATABASE_ID corepack pnpm astro check`
- `env NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid corepack pnpm astro check`

Command results:
- Pull fast-forwarded `main` from `4994083` to `f9b95ad`.
- `openspec list --json` returned no active changes.
- `openspec validate --all --strict` passed: 21 items passed, 0 failed.
- `.agent/tasks.yaml` parsed as YAML.
- `git diff --check` passed.
- `corepack pnpm exec tsc --noEmit` passed.
- `astro check` without Notion credentials passed with 0 errors, 1 warning, and 7 hints, using the empty local fallback.
- `astro check` with invalid Notion credentials passed with 0 errors, 1 warning, and 7 hints, but it attempted a Notion request before falling back.

Result:
- R1 is accepted against its original content-source contract: production is Notion-only, Markdown is non-production material, and active OpenSpec changes are archived.
- The local validation strategy needs to be adjusted before downstream test and CI work so local commands use Markdown fixture source and do not read Notion.

Plan adjustment applied:
- Added a local validation content-source rule to `AGENTS.md`: local test/check/build validation must use Markdown fixture source and must not contact Notion.
- Updated R2 so TDD governance includes this local validation rule.
- Updated R3 to own Markdown fixture source and no-Notion local validation harness.
- Updated R5 to split local Markdown fixture validation from explicit production Notion environment validation.
- Updated R6 to keep default CI on local Markdown fixture validation and local build commands.

Next action:
- Dispatch R2 `establish-tdd-governance` next, with the local validation source rule included in scope.
