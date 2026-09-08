# Report: B01 obsidian-personal-blog-cutover

Status: pass; ready for independent review
Owner: /root/blog
Branch: codex/obsidian-blog-cutover
Worktree: /tmp/vault-pipeline-20260909/blog-worktree
Last updated: 2026-09-09T01:36:55+0800

## Changes

- Replaced the Notion loader and Notion-shaped page normalization with an explicit `CONTENT_DIR` Markdown publication snapshot. Local commands use four repository fixtures; external builds require the supplied directory, reject empty or invalid sources, preserve exact `slug` case, and accept the approved `publish` and `published` states.
- Added strict metadata, duplicate slug, conflict marker, private wikilink and publication asset gates. Unpublished wikilinks render as text. Production validation rejects unresolved local or malformed images. Public remote images render lazily without a build-time request to their host.
- Imported the verified historical URL map and generate 162 permanent redirects, including lowercase `/post/technology/keepass` to exact `/posts/KeePass`.
- Preserved the terminal shell and interactions, including history, autocomplete, `help`, `cd`, `grep` and exact-case `cat KeePass.md`; added responsive mobile navigation/terminal panels and readable code/table/image overflow behavior.
- Added GFM/wikilink/Mermaid support, table of contents, adjacent navigation, archive, CC BY-NC-SA 4.0 footer, Pagefind search hardening and the verified historical Giscus pathname configuration.
- Added canonical/robots/OG/Twitter/JSON-LD metadata plus RSS, sitemap, robots and 404 output using `https://chlorinec.top` and verified personal metadata.
- Added offline fixture CI, Vitest coverage, Playwright browser coverage and a local static preview server that exercises the generated Cloudflare `_redirects` behavior.
- Added and completed active OpenSpec change `obsidian-personal-blog-cutover`, including proposal, design, test design, tasks and capability deltas.

No source-vault file, production environment, remote branch or deployment was written. The three `publish` articles were built locally under the approved main proposal semantics and were not deployed externally.

## Verification

- `pnpm install --frozen-lockfile` — pass; lockfile current.
- `pnpm test` — pass; 9 files, 107 tests.
- `pnpm check` — pass; 66 files, 0 errors, 0 warnings, 0 hints.
- `pnpm build` — pass against four repository Markdown fixtures; generates redirects and Pagefind without Notion.
- `env -u NOTION_TOKEN -u NOTION_DATABASE_ID CONTENT_DIR=/Users/chlorinec/Documents/main-vault/20-writing/published EXPECTED_CONTENT_COUNT=53 PUBLIC_DEPLOYMENT_ENV=production pnpm validate:content` — pass; 53 articles (50 `published`, 3 `publish`). The five historical image defects fixed by root produce no asset warnings. Remaining warnings are two empty historical metadata fallbacks and three unresolved unpublished wikilinks rendered as text.
- Same environment with `pnpm build:content` — pass against the source set whose exporter tree hash is `87f9abe0aece8e15ba42e7e433c0f7c657c87ae4e099109ae0c0c4e13f541ecf`; production static build completed and Pagefind indexed 53 pages / 9711 words. No Notion credentials or API were used, and public image hosts were not contacted by the build.
- Artifact checks — 53 exact article directories, 53 RSS items, 53 sitemap article URLs, 162 generated redirect rules, `/posts/KeePass/index.html`, production `index, follow` metadata and production robots sitemap all present. A source/output scan found no `api.notion`, Notion environment variable or Notion URL reference.
- `PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright E2E_POST_SLUG=KeePass E2E_SEARCH_QUERY=前端 pnpm test:e2e -- --project=chromium` — pass; 7 Chromium checks for shell/article route, terminal help, exact-case `cat`, actual 301 response, Chinese Pagefind search, Giscus pathname attributes and 390px page overflow. The temporary browser cache and traces were removed after the run.
- `openspec validate obsidian-personal-blog-cutover --strict` — pass.
- `git diff --check` — pass.

`openspec validate --all --strict` reports 23 valid items and one pre-existing unrelated failure: `openspec/specs/tdd-governance/spec.md` lacks a `## Purpose` section. B01 did not expand scope to rewrite that archived baseline; the B01 change itself is strict-valid.

## OpenSpec impact

The active change removes the production Notion-only requirement, modifies the Markdown content, route preference, comments, search, pagination, taxonomy and typography contracts, and adds publication snapshot, discovery, metadata and mobile-reading capabilities. It remains active for independent review; the reviewer/supervisor should sync the deltas into base specs and archive only after acceptance.

## Remaining integration

- Independent reviewer/supervisor: inspect the uncommitted worktree diff, accept B01, sync/archive the active OpenSpec change and move the task from `review` to `done`.
- The separate deployment owner must implement and review the authorized staging/deployment workflow that binds an immutable code SHA and content commit to a selectable Cloudflare project. That workflow is outside B01 and must continue to avoid Notion API reads.
- Production remains untouched. No Git push, Cloudflare write or source publication-status writeback occurred.
- Optionally repair the unrelated `tdd-governance` Purpose heading so the legacy full-repository OpenSpec command becomes green.
