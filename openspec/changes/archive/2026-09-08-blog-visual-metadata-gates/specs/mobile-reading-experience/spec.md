## ADDED Requirements

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
