# Obsidian personal blog cutover

## Why

Production content currently depends on Notion, while the approved publishing architecture makes Obsidian Markdown publication snapshots the sole content source. The current site can also build an empty shell, lacks the migration redirects and publication metadata required to replace the historical site, and has no browser gate for the terminal interactions and mobile reading experience.

## What Changes

- Load Markdown from an explicit external publication snapshot and accept only blog-targeted `publish` or `published` entries.
- Preserve frontmatter slugs exactly, including case and non-ASCII text, and reject duplicates or missing production content.
- Render published Markdown with stable heading anchors, safe Obsidian wikilinks, Mermaid blocks, tables, images, and code blocks.
- Preserve the terminal shell and command interactions while improving article layout on small screens.
- Carry forward the historical URL map and Giscus pathname configuration.
- Add page metadata, canonical and social tags, JSON-LD, RSS, sitemap, robots, archive and adjacent-post navigation.
- Add offline unit, content-corpus, build, and Playwright gates that never call Notion.

## Capabilities

### New Capabilities

- `publication-snapshot-source`: external Markdown snapshot loading and release validation.
- `historical-url-compatibility`: static 301 rules inherited from the historical site.
- `publication-discovery`: RSS, sitemap, robots and archive outputs.
- `personal-site-metadata`: verified ChlorineC metadata and per-page SEO.
- `mobile-reading-experience`: content-first small-screen shell and long-form typography.

### Modified Capabilities

- `content-layer-markdown`: becomes the production source and gains the vault publication schema.
- `notion-content-layer`: removed from production and local validation.
- `blog-post-pages`: gains exact slug preservation, article metadata and navigation.
- `typography-rendering`: gains required Obsidian Markdown constructs.
- `pagefind-indexing`: indexes only public article pages during the offline build.
- `pagefind-search-ui`: receives safe excerpts and robust empty/error states.
- `giscus-comments`: fixes the historical repository, category and pathname mapping.
- `shell-layout`: preserves the terminal interaction model while allowing a mobile content-first layout.

## Impact

The change touches the content model, routes, layouts, global styles, build scripts, dependencies, CI, tests, redirect assets and project documentation. It reads the 53-article vault corpus only through an external path for validation; no source article is copied into the repository. Deployment, Git push, Sync repair and source-vault writes remain outside this change.

