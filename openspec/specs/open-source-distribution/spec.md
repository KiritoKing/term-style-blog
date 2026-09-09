# open-source-distribution Specification

## Purpose
Define a licensed, documented and reproducible public source release while preserving private content and deployment boundaries.
## Requirements
### Requirement: Public source SHALL be runnable without private services
The repository MUST provide a license, attribution and documented frozen-install development/build commands using the bundled Markdown collection without requiring private vault access or deployment secrets.

#### Scenario: A reader clones the repository
- **WHEN** the reader follows the quick start on the documented runtime
- **THEN** local tests, checks and build SHALL use bundled Markdown without Notion access
- **THEN** the documentation SHALL identify personal identity, site origin, comments and redirects as fork customization points

### Requirement: Public contribution workflows SHALL preserve deployment boundaries
The repository MUST run unprivileged fixture validation for pull requests and limit the personal publication workflow to the owner repository's main ref. Public release MUST retain the existing manual-preview production policy.

#### Scenario: A fork submits a contribution
- **WHEN** a pull request triggers CI
- **THEN** the workflow SHALL use read-only repository permissions without deployment secrets or private publication content

#### Scenario: Publication is invoked from a fork or non-main branch
- **WHEN** the personal publication workflow is dispatched outside KiritoKing/term-style-blog main
- **THEN** the prepare job SHALL be skipped before secret-bearing dependent jobs run
