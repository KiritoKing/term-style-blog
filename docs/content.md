# Content contract / 内容约定

The blog reads plain Markdown with YAML frontmatter. The source directory comes from the process environment variable `CONTENT_DIR`, or defaults to the bundled demo posts in `src/content/blog/`. It does not call Notion.

## Minimal article

```markdown
---
title: My first post
slug: my-first-post
status: publish
date: "2026-09-09"
category: Technology
tags: [astro, writing]
summary: A short description of the article.
related_content: []
publish:
  target: blog
---

# My first post

Write the article here.
```

| Property | Contract |
| --- | --- |
| `title`, `slug`, `category`, `summary` | Non-empty strings; `Uncategorized` is invalid, case-insensitively |
| `slug` | Exact stable public identifier; case-sensitive and unique across the source |
| `status` | `publish` or `published` only |
| `date` | Valid publication date; quote ISO dates for portable YAML |
| `tags` | Array of strings, including an empty array when appropriate |
| `publish.target` | Exactly `blog` |
| `related_content` | Optional string array, defaults to empty |

`publish` means the author has approved publication; `published` records that the article has actually gone live. Both are build-eligible. The framework does not move drafts, change statuses or write back to the source. Properties such as `due`, `source_notion_url` and `source_notion_id` can preserve planning/provenance; a historical Notion URL does not enable a Notion integration.

The build rejects an empty collection, duplicate slugs, conflict markers, missing/placeholder categories, blank summaries, invalid publication states and wrong targets. Every Markdown file under `CONTENT_DIR` participates: do not point it at your whole vault or a folder containing drafts.

## Links, images and diagrams

- Markdown links, tables, fenced code and Mermaid blocks are supported.
- Obsidian wikilinks to included articles resolve within the published collection. Unpublished targets render as text; the renderer does not copy private notes into the output.
- The pipeline does not upload images. Use already-published remote image URLs and configure allowed image hosts where required by Astro.
- Local image references and Obsidian image embeds are reported during validation. `STRICT_CONTENT_ASSETS=1` or production mode rejects unresolved local assets.
- Referencing a remote image may contact its host during the build or in the reader's browser. Only use media you intend to publish and have permission to distribute.

Use stable slugs to keep existing URLs when renaming files. When you intentionally change a slug, update `scripts/historical-url-map.json` with the old path and new destination, then rebuild and verify the real hosted redirect.

## Snapshot integration

The personal Actions workflow expects `blog-publish-manifest.json` plus `20-writing/published/**/*.md` in a separate publication snapshot. The validator verifies the exact allowed file set, content bytes, hashes and exporter schema-v1 field order before building. See `scripts/validate-publication-snapshot.mjs` and `tests/fixtures/publication-exporter-v1/` for the executable contract and synthetic example.

Manifest validation is an integrity boundary, not a general detector of sensitive prose. The author must approve what leaves the vault. The framework repository intentionally contains only demo/synthetic content; live blog articles use a separate private source.
