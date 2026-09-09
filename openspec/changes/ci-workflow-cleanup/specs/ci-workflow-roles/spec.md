## ADDED Requirements
### Requirement: CI roles SHALL be separate from publication
Code validation MUST run without private publication content or deployment credentials. Cloudflare publication MUST retain its explicit immutable-content events and policy gates. Legacy Vercel Git deployment MUST be disabled.

#### Scenario: A framework pull request is updated
- **WHEN** a new pull request commit arrives
- **THEN** CI and security checks SHALL validate it without publishing blog content
- **THEN** Vercel SHALL not create an automatic deployment from the commit

### Requirement: Dependency maintenance SHALL be grouped and predictable
Routine dependency update checks MUST follow a documented weekly schedule and group compatible updates. Security updates MUST remain enabled without waiting for a routine version-update window.

#### Scenario: Dependencies receive routine updates
- **WHEN** the weekly check runs
- **THEN** compatible npm and action updates SHALL be grouped into a bounded number of reviewable pull requests
