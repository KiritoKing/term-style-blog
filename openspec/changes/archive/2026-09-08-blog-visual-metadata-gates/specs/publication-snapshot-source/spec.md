## ADDED Requirements

### Requirement: Categories SHALL be meaningful for every publication status
The exporter and build MUST reject missing, blank, whitespace-only or Uncategorized placeholder categories for publish and published entries before producing a deployable snapshot or site. The display model MUST NOT synthesize an Uncategorized fallback.

#### Scenario: Historical article has invalid category
- **WHEN** a published article has a missing or placeholder category
- **THEN** validation SHALL fail with the source path and category diagnostic
- **THEN** no historical compatibility exemption SHALL allow deployment

#### Scenario: Approved new article has a valid category
- **WHEN** a publish entry has a meaningful category and all other required metadata
- **THEN** its category SHALL be retained without arbitrary reclassification
