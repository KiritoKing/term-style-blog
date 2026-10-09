## ADDED Requirements

### Requirement: Main publication SHALL remain separate from pull request validation
The owned main push SHALL invoke immutable publication in addition to credential-free CI. The publication workflow MUST accept only owned main push, approved content dispatch and existing manual events, MUST NOT trigger on pull requests, and MUST keep read-only repository permissions without granting new external access.

#### Scenario: Framework PR is opened or updated
- **WHEN** a PR or fork receives a commit
- **THEN** only credential-free source CI SHALL run and production publication SHALL remain unavailable

#### Scenario: Owner merges a framework PR
- **WHEN** the reviewed commit updates owned main
- **THEN** CI SHALL validate public fixture content and the separate publication workflow SHALL resolve immutable accepted content under existing deployment gates
