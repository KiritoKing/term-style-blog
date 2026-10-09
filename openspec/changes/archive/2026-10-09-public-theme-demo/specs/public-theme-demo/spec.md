## ADDED Requirements

### Requirement: Public demo SHALL use one bounded dedicated static project
The system MUST build only the neutral repository demo without secrets, bind output to a full commit SHA, check project count and free static-asset limits, and create or reuse only the explicitly authorized independent Direct Upload project. It MUST deploy only its preview branch without modifying another project, Access, credentials or paid plans.

#### Scenario: Existing capability can create a dedicated demo
- **WHEN** the owned feature workflow has valid synthetic output and fewer than 100 projects
- **THEN** it SHALL create the fixed project with a reserved unused production branch and deploy its public-demo preview branch

#### Scenario: Quota, permission or existing project contract fails
- **WHEN** project limits, API authorization or the dedicated project contract cannot be verified
- **THEN** deployment MUST fail with sanitized evidence and no permission widening or unrelated project mutation

### Requirement: Public demo acceptance SHALL be anonymous and SHA-bound
Acceptance MUST use no Access credentials, allow only the dedicated project origin, reject redirects/stale content, and validate every generated HTML route, noindex policy, synthetic identity, images and viewer behavior in desktop/mobile and light/dark Chromium sessions.

#### Scenario: Public Pages output is current
- **WHEN** anonymous HTTP returns the expected immutable identity and neutral demo
- **THEN** browser acceptance SHALL verify open/zoom/fit/Escape/focus, repeated operation and Astro navigation and preserve screenshots and full SHA evidence

#### Scenario: Authentication or another origin is returned
- **WHEN** an Access login, redirect, production host or mismatched SHA is encountered
- **THEN** acceptance MUST fail without supplying credentials or changing Access
