## ADDED Requirements
### Requirement: Hosted acceptance SHALL prove immutable page identity
Automatic acceptance MUST authenticate only to the exact Pages origin when configured and MUST verify the expected source identity, every generated HTML route and indexing policy before promotion. Production acceptance MUST check the canonical public domain without Access credentials.

#### Scenario: Access login or stale content is returned
- **WHEN** a hosted response is an authentication page, redirect, stale publication or incomplete route inventory
- **THEN** acceptance MUST fail without forwarding credentials across origins or promoting the candidate

#### Scenario: Approved content is saved
- **WHEN** the healthy Sync receiver yields a changed approved snapshot and the installation explicitly enables automatic production
- **THEN** successful immutable local and hosted acceptance SHALL promote that exact content and verify its identity at the canonical domain

#### Scenario: A promoted candidate fails final acceptance
- **WHEN** the canonical domain does not serve the expected candidate within a bounded propagation window
- **THEN** the workflow SHALL report failure and attempt recovery to its recorded previous production deployment only if its candidate is still current
