# ci-workflow-roles Specification

## Purpose
Keep source validation, security maintenance and immutable content publication explicit, without legacy deployment duplication.
## Requirements
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

### Requirement: Explicit feature previews SHALL use isolated public demo artifacts
An explicitly authorized same-repository feature branch MAY have its own preview workflow. It MUST build only repository public/synthetic demo content, use preview noindex policy, bind build/deploy/hosted verification to the full branch commit SHA, and deploy only a non-main Pages preview branch. Build/test MUST run without deployment secrets; only controlled deploy/hosted acceptance steps MAY use existing credentials. The production publication workflow MUST retain its current duties.

#### Scenario: Authorized image viewer preview
- **WHEN** the owned image viewer feature branch is pushed
- **THEN** independent CI SHALL validate public content and an isolated workflow SHALL deploy and authenticate verification of that exact SHA's demo without checking out private content or uploading to production

### Requirement: Main publication SHALL remain separate from pull request validation
The owned main push SHALL invoke immutable publication in addition to credential-free CI. The publication workflow MUST accept only owned main push, approved content dispatch and existing manual events, MUST NOT trigger on pull requests, and MUST keep read-only repository permissions without granting new external access.

#### Scenario: Framework PR is opened or updated
- **WHEN** a PR or fork receives a commit
- **THEN** only credential-free source CI SHALL run and production publication SHALL remain unavailable

#### Scenario: Owner merges a framework PR
- **WHEN** the reviewed commit updates owned main
- **THEN** CI SHALL validate public fixture content and the separate publication workflow SHALL resolve immutable accepted content under existing deployment gates
