# Report: B04 metadata gate

Status: review

## Changes

- Removed the historical `published` exception in `validatePublicationRecords`.
  Both `publish` and `published` now require non-empty `category` and `summary`.
- Missing, non-string, blank/whitespace category, and case-insensitive
  `Uncategorized` are rejected with `<relative-file>: required field category`
  diagnostics.
- Removed `normalizeMarkdownBlogPost` fallbacks to `Uncategorized` and title.
  Direct normalization now throws a file/field diagnostic if validation was
  bypassed.
- Tightened the Astro content schema with trimmed non-empty title, slug,
  category and summary fields. Its category predicate is shared with the
  deployment validator, so the placeholder cannot enter runtime content.
- Added the same category and summary gate to the Deno vault exporter for both
  public statuses. Existing target/status/tags/date/conflict/secret/asset gates
  remain intact.

## Tests added or updated

- `src/test/publication.test.ts`: both public statuses across missing, blank,
  whitespace, `Uncategorized`, lowercase/trimmed placeholder category, and
  missing/blank/whitespace summary.
- `src/test/blog-markdown.test.ts`: normalizer rejects blank category and
  summary instead of inventing display metadata.
- Vault `tests/exporter_test.ts`: both statuses fail closed for missing,
  whitespace and placeholder category and for missing/whitespace summary.

## Before and after evidence

Before the fix, the real deployment validator exited 0 for 53 articles and
printed:

```text
[content warning] rog-ally-xbox-x-掌机折腾记录.md: empty historical category; using Uncategorized
[content warning] rog-ally-xbox-x-掌机折腾记录.md: empty historical summary; using title
Validated 53 Markdown articles (50 published, 3 publish)
```

The RED unit run had four framework failures: `published` metadata was accepted,
`publish` emitted the compatibility error, and both normalizer fallbacks
returned values. The RED exporter run had 1 failing test because invalid
metadata was accepted.

After the fix, the same real validator exits 1 before build output with:

```text
rog-ally-xbox-x-掌机折腾记录.md: required field category must be a non-empty string
```

The real Deno exporter `check` also exits 1 with `INVALID_METADATA` and the same
relative filename/category diagnostic.

## Real 53-article inventory

Exactly one article has missing required category or summary; no source file was
edited:

| Path | Status | Missing | Current | Candidate only |
| --- | --- | --- | --- | --- |
| `rog-ally-xbox-x-掌机折腾记录.md` | `published` | `category`, `summary` | both empty strings; tags also empty but valid under the existing schema | Category: `Technology` (fits the existing taxonomy and device/OS topic). Summary: `记录 ROG Ally Xbox X 安装 Bazzite Linux 的系统选择、U 盘制作和安装步骤。` |

This candidate is advisory. A human/source-owner must choose and write the final
metadata.

## Commands run

- RED: `pnpm vitest run src/test/publication.test.ts src/test/blog-markdown.test.ts`
  — failed 4 tests as expected.
- RED: focused Deno exporter test — failed 1 test as expected.
- `pnpm test` — 111 passed, 0 failed.
- `pnpm check` — fixture precheck passed; Astro reported 0 errors, warnings or
  hints across 69 files.
- `deno task fmt && deno task lint && deno task check && deno task test` — all
  passed; 17 tests passed, 0 failed.
- Real corpus validator and exporter check — both intentionally exit 1 at the
  deficient ROG article with filename and category diagnostics.

## OpenSpec impact

The base `publication-snapshot-source` spec already requires category and
summary. This repair makes implementation match that requirement. Root owns the
active `blog-visual-metadata-gates` change/spec coordination; no OpenSpec or
registry file was edited here.

## Risks and follow-ups

- Production remains correctly blocked until the source owner supplies category
  and summary for the one reported article.
- The previous 53-file isolated output was generated before this gate and must
  not be committed/pushed as the corrected publication snapshot. Re-export
  after source metadata is approved and synchronized.
- B03/B05 own rendering and full visual validation. No dist rebuild, deployment,
  Git push, merge, Pages change, or source-article write occurred.

## Supervisor integration update

Root read the actual article and corrected its two metadata fields within the user's explicit defect-remediation scope. No body/provenance/date fields changed. The real53-file check now passes with source tree `377cc0b39f0feb8527dd5b34e9e83db2d06d132688c82d605e6411cf09d8e496`.

The strict exporter is installed on Hermes as v3, server fmt/lint/check and17tests passed. Root backed up the unit, switched version paths only, and verified real execution success with the same content hash and dispatch=false. The prior v2 runtime and unit backup remain available. Rendering acceptance is separate and still in progress.
