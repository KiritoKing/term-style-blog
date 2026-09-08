# publication-snapshot-source Specification

## Purpose
TBD - created by archiving change obsidian-personal-blog-cutover. Update Purpose after archive.
## Requirements
### Requirement: Production content SHALL come from an explicit Markdown publication snapshot
The system MUST load production articles from the directory named by `CONTENT_DIR` and MUST NOT contact Notion during test, check, or build commands.

#### Scenario: Build an approved snapshot
- **WHEN** the external directory contains blog-targeted Markdown with status `publish` or `published`
- **THEN** every approved entry SHALL join the public collection
- **THEN** no file outside that directory SHALL join the collection

#### Scenario: Production source is missing or empty
- **WHEN** the content build has no readable Markdown source or contains zero entries
- **THEN** it MUST fail with a source-specific diagnostic

### Requirement: Publication metadata SHALL be validated before rendering
The system MUST require title, exact slug, date, category, tags, summary, status, and `publish.target`; it MUST reject duplicate slugs and merge conflict markers, and MUST keep unresolved wikilinks and local image references out of generated public links. Preview validation MUST report actionable asset warnings and production validation MUST reject unresolved local or malformed image references.

#### Scenario: A snapshot could expose invalid or private content
- **WHEN** an entry has an unapproved status or target or duplicates another slug
- **THEN** the build MUST fail before publishing output
- **WHEN** an entry names an unpublished wikilink target or local image
- **THEN** the build MUST render no public target for it and MUST report the source path
