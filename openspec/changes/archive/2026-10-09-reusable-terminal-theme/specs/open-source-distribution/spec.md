## MODIFIED Requirements

### Requirement: Public source SHALL be runnable without private services
The repository MUST provide a license, attribution and documented frozen-install development/build commands using the bundled Markdown collection without requiring private vault access or deployment secrets.

#### Scenario: A reader clones the repository
- **WHEN** the reader follows the quick start on the documented runtime
- **THEN** local tests, checks and build SHALL use bundled Markdown without Notion access
- **THEN** the documentation SHALL identify `site.config.ts` as the typed entry for identity, origin, About, network, optional comments and redirects; the default build SHALL use neutral template identity, no comments and no inherited redirects

### Requirement: Public contribution workflows SHALL preserve deployment boundaries
The repository MUST run unprivileged fixture validation for pull requests and limit the personal publication workflow to the owner repository's main ref. Public release MUST retain the existing guarded publication trigger and production policy, with the owner profile explicitly selected only for owner publication builds.

#### Scenario: A fork submits a contribution
- **WHEN** a pull request triggers CI
- **THEN** the workflow SHALL use read-only repository permissions without deployment secrets or private publication content

#### Scenario: Publication is invoked from a fork or non-main branch
- **WHEN** the personal publication workflow is dispatched outside KiritoKing/term-style-blog main
- **THEN** the prepare job SHALL be skipped before secret-bearing dependent jobs run

## ADDED Requirements

### Requirement: Catalogue material SHALL describe reproducible public theme assets
The repository MUST provide accurate installation and English submission material, with no more than four original synthetic screenshots totaling at most 8 MB. A protected acceptance preview MUST NOT be described as a public catalogue demo.

#### Scenario: Prepare a catalogue submission
- **WHEN** the maintainer reviews submission material
- **THEN** the material SHALL identify current Portal submission, MIT source attribution, configurable content licensing and any public-hosting blocker
