# ChlorineC's terminal blog

Astro static blog with a terminal-inspired shell. Production content is an immutable Obsidian Markdown publication snapshot; builds do not read Notion.

## Content contract

Set `CONTENT_DIR` to the snapshot's `20-writing/published` directory. Every Markdown file in that directory must include an exact, stable `slug`, `status: publish|published`, `publish.target: blog`, title, date, category, tags and summary. File names may change without changing the public URL. Slug case is significant.

Local `pnpm test`, `pnpm check` and `pnpm build` use the repository's small fixture collection. A production candidate must use the explicit external source:

```sh
CONTENT_DIR=/absolute/snapshot/20-writing/published \
EXPECTED_CONTENT_COUNT=53 \
PUBLIC_DEPLOYMENT_ENV=preview \
STRICT_CONTENT_ASSETS=1 \
pnpm build:content
```

The validator rejects empty sources, invalid publication states, wrong targets, duplicate slugs, conflict markers, blank category/summary and the placeholder category `Uncategorized` for both `publish` and `published`. Unpublished Obsidian wikilinks render as text and local image references emit source-specific warnings, so the build cannot copy private notes or local assets into the site.

## Quality gates

```sh
pnpm test
pnpm check
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

For the real corpus browser gate, build first with the external source and run:

```sh
E2E_POST_SLUG=KeePass E2E_SEARCH_QUERY=前端 \
E2E_REAL_CORPUS=1 E2E_REAL_LISTINGS=1 pnpm test:e2e
```

The build generates Pagefind, RSS, sitemap, robots and 162 permanent historical redirects. Preview builds use `noindex`; set `PUBLIC_DEPLOYMENT_ENV=production` only in an authorized production deployment workflow.


## Automatic publication and preview review

Hermes reads the Sync-managed vault and exports only the approved publication directory into the separate `publish-snapshots` Git branch. It never pulls Git changes into the live vault. A changed immutable snapshot dispatches this repository's publication workflow; unchanged snapshots produce no new commit or deployment.

The current rollout uses repository variables `PUBLICATION_PRODUCTION_ENABLED=false` and `PUBLICATION_PREVIEW_REVIEW=manual`. Automatic content events deploy isolated, noindex Cloudflare Pages previews. The workflow still validates the manifest, metadata, assets, built indexing policy and browser regressions; its summary records online preview acceptance as pending. Cloudflare Access login pages are not successful blog-page checks.

Production retries remain blocked under this policy. Production requires an explicitly enabled production policy plus automatic online preview verification. The existing production site remains the rollback baseline until a candidate passes the required online acceptance and cutover is performed.
