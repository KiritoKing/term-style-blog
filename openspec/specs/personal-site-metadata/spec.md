# personal-site-metadata Specification

## Purpose
TBD - created by archiving change obsidian-personal-blog-cutover. Update Purpose after archive.
## Requirements
### Requirement: Pages SHALL expose verified personal site metadata
The system MUST emit Chinese language, page title, description, canonical, Open Graph, Twitter, author and structured-data metadata based on the verified ChlorineC profile.

#### Scenario: Read an article
- **WHEN** a crawler requests a post page
- **THEN** metadata SHALL identify `ChlorineC's Blog`, author `ChlorineC`, the exact canonical post URL and article publication date
