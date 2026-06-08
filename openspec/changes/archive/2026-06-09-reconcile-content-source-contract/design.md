## Context

The current implementation defines the Astro `blog` collection with `notionLoader` in `src/content.config.ts`, while `openspec/specs/content-layer-markdown/spec.md` still requires every blog post to be stored as Markdown. The repository also contains `src/content/blog/*.md` sample posts, but those files are not wired into the active collection loader.

Downstream Day 1 tasks depend on a single source contract. R3 needs to know whether fixtures model Notion entries or Markdown posts, R5 needs a stable environment-check boundary, and SEO/RSS/migration tasks need one normalized post metadata shape.

## Goals / Non-Goals

**Goals:**

- Declare Notion as the canonical production content source for the `blog` collection.
- Preserve the existing page-facing post model: `id`, optional `slug`, `title`, `date`, `category`, `tags`, and `description`.
- Keep local Markdown files out of the production collection contract while allowing them to be reused later as non-production fixtures.
- Make source strategy and Notion property aliases explicit in code.
- Add a schema boundary for the Notion loader entry data that the normalization layer consumes.
- Let non-production validation proceed with an empty collection when Notion credentials are missing or rejected.

**Non-Goals:**

- Do not build the R3 fixture or Notion fallback harness.
- Do not build full fixture data, credential validation UI, or a production fallback; that remains R3/R5 work.
- Do not remove or migrate existing Markdown sample files in this change.
- Do not add a second production collection or dual-source merge behavior.

## Decisions

### Decision: Notion-only production strategy

The production `blog` collection remains backed by `notionLoader` only. This matches the current implementation and avoids a dual-source merge layer that would need conflict rules for duplicate slugs, dates, body rendering, and taxonomy metadata.

Alternative considered: support both Notion and Markdown as production sources. Rejected for R1 because downstream tasks need a stable canonical model before fixtures, CI, SEO, RSS, and redirects are built.

### Decision: Keep Markdown files as non-production material

The Markdown files under `src/content/blog` are not deleted in R1. They may become fixtures or examples in R3, but R1 explicitly prevents them from being treated as production source data.

Alternative considered: delete Markdown samples immediately. Rejected because removal is unnecessary to resolve the contract and could erase useful fixture material before the test harness exists.

### Decision: Centralize the Notion metadata contract

`src/data/contentSource.ts` defines the production source, collection name, and Notion property aliases. `src/data/blog.ts` imports those aliases instead of carrying an implicit local map. This keeps future tests and route helpers tied to the same contract.

Alternative considered: leave aliases inline in `blog.ts`. Rejected because the source contract would remain implicit and harder for downstream tasks to assert.

### Decision: Use an empty non-production validation fallback

`src/data/notionContentLoader.ts` wraps `notionLoader` and only falls back to an empty collection when `allowEmptyFallback` is enabled. `src/content.config.ts` enables that fallback for non-production mode, while production keeps the normal Notion failure behavior.

Alternative considered: require valid credentials for R1. Rejected because R1 blocks R3/R5, and those downstream tasks are where fuller fixture and env harness work is planned.

Alternative considered: load Markdown files as the fallback. Rejected because it would reintroduce a second production-like content source and undermine the Notion-only contract.

### Decision: Add a permissive Notion entry schema

`src/content.config.ts` validates that entries expose a Notion-style `properties` record whose values include a string `type`, while using passthrough behavior for loader-specific fields. This gives Astro a type boundary without stripping data the loader or renderer may need.

Alternative considered: define a strict schema for every Notion property. Rejected because Notion database property names are configurable and the normalization layer already supports aliases.

## Risks / Trade-offs

- Non-production validation can pass with an empty collection even when real Notion content is unavailable. Mitigation: production mode does not enable the fallback, so deploy/build behavior still requires Notion.
- Markdown sample files remain in `src/content/blog`, which could confuse future workers. Mitigation: the specs and source contract state they are non-production, and R3 can move or formalize them as fixtures.
- A permissive schema validates only the portion of Notion entry data consumed by current pages. Mitigation: keep strict field normalization in `src/data/blog.ts` and expand schema in later content-model work if needed.

## Migration Plan

1. Create R1 OpenSpec artifacts and validate the change.
2. Add the source-contract and loader helpers, then wire them into `src/content.config.ts` and `src/data/blog.ts`.
3. Run OpenSpec and Astro validation commands.
4. Sync the delta specs into main specs.
5. Archive the completed change and update `.agent` reports/handoffs.

Rollback is limited to reverting the helpers, content config schema, `blog.ts` import, and OpenSpec sync/archive changes.

## Open Questions

- R3 should decide whether Markdown examples stay under `src/content/blog` or move to a dedicated fixture directory.
- R5 should decide whether production builds need a stricter preflight credential diagnostic before invoking the Notion loader.
