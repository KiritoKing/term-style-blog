## ADDED Requirements

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

