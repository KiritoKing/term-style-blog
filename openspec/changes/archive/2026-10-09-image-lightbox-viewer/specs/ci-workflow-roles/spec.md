## ADDED Requirements

### Requirement: Explicit feature previews SHALL use isolated public demo artifacts
An explicitly authorized same-repository feature branch MAY have its own preview workflow. It MUST build only repository public/synthetic demo content, use preview noindex policy, bind build/deploy/hosted verification to the full branch commit SHA, and deploy only a non-main Pages preview branch. Build/test MUST run without deployment secrets; only controlled deploy/hosted acceptance steps MAY use existing credentials. The production publication workflow MUST retain its current duties.

#### Scenario: Authorized image viewer preview
- **WHEN** the owned image viewer feature branch is pushed
- **THEN** independent CI SHALL validate public content and an isolated workflow SHALL deploy and authenticate verification of that exact SHA's demo without checking out private content or uploading to production
