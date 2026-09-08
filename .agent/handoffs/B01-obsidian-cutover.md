# Handoff: B01 obsidian-personal-blog-cutover

Status: done
Owner: /root/blog
Branch: codex/obsidian-blog-cutover
Last updated: 2026-09-09T01:36:55+0800

Objective: Cut the personal terminal-style blog from build-time Notion to an external Obsidian Markdown publication snapshot, preserving historical URLs and interactions while adding essential publication, search, mobile and offline validation support.

Relevant specs: `openspec/changes/obsidian-personal-blog-cutover/**`
Allowed paths: `src/**`, `public/**`, `tests/**`, `scripts/**`, `openspec/**`, `.agent/**`, `docs/**`, `.github/**`, root package/config/readme files listed in B01.
Locked/shared paths: B01 owns all blog shared files until supervisor review.

## Completed

- OpenSpec proposal/design/deltas/test design written before implementation and all 13 tasks checked.
- Markdown snapshot source, validator, rendering, 162 redirects, exact slugs, discovery/SEO, Giscus pathname, search, archive/adjacent navigation and mobile fixes implemented.
- Offline CI and real-content Chromium checks implemented.
- Root's four-article/five-image source repairs re-read successfully; strict production asset gate now passes for exporter tree hash `87f9abe0aece8e15ba42e7e433c0f7c657c87ae4e099109ae0c0c4e13f541ecf`.
- Report: `.agent/reports/B01-obsidian-cutover.md`.

## In progress

None. Awaiting independent review. Changes remain uncommitted in the isolated worktree.

## Blocked by

No B01 code blocker. Production deployment is intentionally outside this contract.

## Next actions

1. Review the diff and repeat the commands in the report.
2. Sync accepted delta specs and archive `obsidian-personal-blog-cutover`.
3. Mark B01 `done` and release its blog file locks.
4. Integrate the separate fixed-code-SHA/content-commit Cloudflare staging workflow without introducing Notion reads.

## Files changed

- Content and build boundary: `src/content.config.ts`, `src/lib/publication.ts`, `src/lib/blog-model.ts`, `src/data/**`, `astro.config.mjs`, `package.json`, `pnpm-lock.yaml`.
- Publication behavior: `src/layouts/**`, `src/pages/**`, `src/styles/global.css`, terminal/shell components, `src/lib/site.ts`, `src/lib/redirects.ts`, Markdown remark transform.
- Compatibility/discovery: `scripts/historical-url-map.json`, `scripts/generate-redirects.ts`, `public/_redirects`, RSS/sitemap/robots/archive/404 routes.
- Validation/governance: unit tests, `tests/e2e/blog-cutover.spec.ts`, `scripts/serve-dist.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, OpenSpec artifacts and this `.agent` state.

## Tests added or updated

107 passing Vitest tests and seven passing Chromium E2E checks. See the report for exact commands and corpus counts.

## Command results

Local test/check/build, production 53-article validation/build, Chromium E2E, B01 strict OpenSpec and diff check pass. Full repository OpenSpec is 23/24 because the unrelated legacy `tdd-governance` base spec lacks `## Purpose`.

## Risks and open questions

- Deployment orchestration and Cloudflare credentials/project selection remain with the separate integration owner.
- Two historical entries use category/summary compatibility fallback, and three links to unpublished notes render as text; both are explicit non-fatal corpus warnings.

## Supervisor acceptance

Root completed independent review and mobile-control repair; see `.agent/reports/B01-supervisor-review.md`. B01 specs synchronized and archived at `openspec/changes/archive/2026-09-08-obsidian-personal-blog-cutover/`. B01 locks released; deployment remains the separate B02 integration.
