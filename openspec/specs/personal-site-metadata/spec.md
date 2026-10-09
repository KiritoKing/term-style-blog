# personal-site-metadata Specification

## Purpose
TBD - created by archiving change obsidian-personal-blog-cutover. Update Purpose after archive.
## Requirements
### Requirement: Pages SHALL expose verified personal site metadata
The system MUST emit configured language, page title, description, canonical, Open Graph, Twitter, author and structured-data metadata based on the selected typed profile.

#### Scenario: Read an article
- **WHEN** a crawler requests a post page built with the explicit `chlorine` profile
- **THEN** metadata SHALL identify `ChlorineC's Blog`, author `ChlorineC`, the exact canonical post URL and article publication date

#### Scenario: Build a neutral template
- **WHEN** no SITE_PROFILE is selected
- **THEN** metadata and shell/terminal identity SHALL use the neutral template, and SITE_URL SHALL override the canonical origin consistently

#### Scenario: Invalid profile or origin
- **WHEN** a build selects an unknown profile or a non-origin URL
- **THEN** configuration SHALL fail clearly rather than silently publish an unintended identity
