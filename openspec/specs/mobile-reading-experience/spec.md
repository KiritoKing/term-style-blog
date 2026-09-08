# mobile-reading-experience Specification

## Purpose
TBD - created by archiving change obsidian-personal-blog-cutover. Update Purpose after archive.
## Requirements
### Requirement: The terminal shell SHALL remain usable on narrow reading viewports
The system MUST preserve terminal navigation and visual identity while keeping article text, images, tables and code readable without page-level horizontal scrolling at 390 CSS pixels.

#### Scenario: Read a long article on mobile
- **WHEN** the viewport width is 390 CSS pixels
- **THEN** the article SHALL be the primary visible region
- **THEN** wide code and tables SHALL scroll inside their own containers
- **THEN** terminal controls SHALL remain reachable

### Requirement: Motion preferences SHALL be respected
The system MUST disable flicker, scanline animation and decorative transitions when `prefers-reduced-motion` is active.

#### Scenario: Reduced motion is requested
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** decorative animations SHALL be disabled without hiding content

### Requirement: Visual acceptance SHALL cover the generated route inventory
The release audit MUST enumerate all generated HTML routes, verify redirects, and inspect every rendered destination at desktop and mobile sizes. It MUST combine container-level geometry checks with visual assertions and recorded screenshots, and MUST NOT treat hidden page overflow as proof of correct rendering.

#### Scenario: Long encoded route in a terminal prompt
- **WHEN** a Unicode article route produces a long encoded pathname
- **THEN** terminal prompt text and controls SHALL remain readable and contained at 390 CSS pixels and desktop width
- **THEN** prompt overflow that scrolls ancestor containers or clips article content SHALL fail acceptance; deliberate path ellipsis MAY preserve space for the command input

#### Scenario: Complete rendered corpus audit
- **WHEN** the release corpus is built
- **THEN** every generated route SHALL be recorded as a verified redirect or a visually inspected rendered page
- **THEN** unavailable visual assertions and failed pages SHALL be reported explicitly, never counted as passing
