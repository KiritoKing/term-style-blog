# ChlorineC's terminal blog

Astro static blog with a terminal-inspired shell. Production content is an immutable Obsidian Markdown publication snapshot; builds do not read Notion.

## Content contract

Set `CONTENT_DIR` to the snapshot's `20-writing/published` directory. Every Markdown file in that directory must include an exact, stable `slug`, `status: publish|published`, `publish.target: blog`, title, date, category, tags and summary. File names may change without changing the public URL. Slug case is significant.

Local `pnpm test`, `pnpm check` and `pnpm build` use the repository's small fixture collection. A production candidate must use the explicit external source:

```sh
CONTENT_DIR=/absolute/snapshot/20-writing/published \
EXPECTED_CONTENT_COUNT=53 \
PUBLIC_DEPLOYMENT_ENV=preview \
pnpm build:content
```

The validator rejects empty sources, invalid publication states, wrong targets, duplicate slugs and conflict markers. Unpublished Obsidian wikilinks render as text and local image references emit source-specific warnings, so the build cannot copy private notes or local assets into the site.

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
E2E_POST_SLUG=KeePass E2E_SEARCH_QUERY=前端 pnpm test:e2e
```

The build generates Pagefind, RSS, sitemap, robots and 162 permanent historical redirects. Preview builds use `noindex`; set `PUBLIC_DEPLOYMENT_ENV=production` only in an authorized production deployment workflow.
