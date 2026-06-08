## Why

The active specs currently require both Markdown-backed blog storage and Notion-backed blog storage, while the implementation already configures the `blog` collection with `notionLoader`. This conflict blocks later content fixtures, build stabilization, SEO, RSS, and migration work because downstream changes cannot rely on one canonical post model.

## What Changes

- **BREAKING**: Treat Notion as the only production content source for the `blog` collection.
- Reclassify local Markdown blog files as non-production examples or future test fixtures, not canonical production storage.
- Keep the `blog` collection name and page-facing metadata contract stable for existing pages.
- Make the production source strategy and Notion property aliases explicit in code.
- Add a content-layer schema for the Notion loader entry shape used by page rendering and post normalization.
- Add a non-production empty-collection fallback so local validation can run when Notion credentials are absent or rejected.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `notion-content-layer`: clarify that Notion is the canonical production source for `blog` entries and define the stable metadata fields expected by pages.
- `content-layer-markdown`: remove the production Markdown storage requirement and constrain Markdown files to non-production examples or future fixtures.

## Impact

- Affected specs: `openspec/specs/notion-content-layer/spec.md`, `openspec/specs/content-layer-markdown/spec.md`.
- Affected code: `src/content.config.ts`, `src/data/blog.ts`, and small source-contract/loader helpers under `src/data/`.
- No dependency changes are required.
- Production builds still require valid Notion credentials; the fallback is only for non-production validation.
