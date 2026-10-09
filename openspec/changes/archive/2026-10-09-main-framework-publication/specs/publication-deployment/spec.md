## ADDED Requirements

### Requirement: Main framework updates SHALL reuse validated published content
An owned repository main push MUST bind the exact pushed framework SHA to the immutable content reference in canonical production publication metadata. The system SHALL validate production identity and the matching complete sanitized snapshot before build. It MUST retain existing preview/production policy gates, protected hosted acceptance, environment protection, serialized upload and current framework/content branch-tip checks immediately before upload.

#### Scenario: Main receives a framework update
- **WHEN** the owner pushes main and valid canonical production metadata identifies the current publication snapshot
- **THEN** the workflow SHALL build and verify the pushed framework SHA with that exact content SHA, manifest and tree hash
- **THEN** production SHALL occur only under explicit true/automatic policy and successful preview acceptance

#### Scenario: Canonical metadata or snapshot is unavailable or invalid
- **WHEN** canonical production metadata is missing, redirected, malformed, preview-mode or cannot bind a valid immutable snapshot
- **THEN** the run MUST fail without production upload or fallback to demo content

#### Scenario: Queued or prepared main candidate becomes stale
- **WHEN** main or the publication branch advances before serialized production upload
- **THEN** the workflow MUST reject the old candidate immediately before upload and preserve any newer deployment

#### Scenario: Main publication is not configured
- **WHEN** valid inputs arrive without production enablement and automatic preview review
- **THEN** the workflow SHALL remain preview-only using the existing safe policy
