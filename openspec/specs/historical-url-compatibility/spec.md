# historical-url-compatibility Specification

## Purpose
TBD - created by archiving change obsidian-personal-blog-cutover. Update Purpose after archive.
## Requirements
### Requirement: Historical aliases SHALL permanently redirect to exact canonical slugs
The system MUST generate static 301 redirects for all 162 inherited historical paths and MUST preserve case and non-ASCII canonical slugs.

#### Scenario: Request a historical path
- **WHEN** a reader requests any inherited alias
- **THEN** the response SHALL redirect with status 301 to `/posts/<exact-slug>`

#### Scenario: Build the KeePass article
- **WHEN** the article file is named `keepass.md` and its slug is `KeePass`
- **THEN** the canonical output SHALL be `/posts/KeePass`
