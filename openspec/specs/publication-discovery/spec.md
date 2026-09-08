# publication-discovery Specification

## Purpose
TBD - created by archiving change obsidian-personal-blog-cutover. Update Purpose after archive.
## Requirements
### Requirement: Public discovery outputs SHALL use the approved article collection
The system MUST generate RSS, sitemap, robots and archive output from the same approved Markdown collection.

#### Scenario: Build discovery files
- **WHEN** the static site is built
- **THEN** RSS and sitemap SHALL include each public canonical article URL
- **THEN** Pagefind SHALL index public article content
- **THEN** robots SHALL advertise the sitemap

#### Scenario: Preview deployment
- **WHEN** `PUBLIC_DEPLOYMENT_ENV` is not `production`
- **THEN** robots and page metadata SHALL prevent indexing
