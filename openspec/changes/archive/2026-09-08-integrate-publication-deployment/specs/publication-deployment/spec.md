## ADDED Requirements

### Requirement: Deployment SHALL bind immutable framework and publication inputs
The system MUST accept only the fixed publication repository and branch, full immutable framework and content SHAs, and matching manifest and source-tree SHA-256 values before a deployment candidate is built.

#### Scenario: An automatic publication event arrives
- **WHEN** `content_published_changed` identifies an approved immutable snapshot
- **THEN** the workflow SHALL validate the repository, branch, content SHA, manifest hash, tree hash and SHA-bound dispatch id
- **THEN** both `publish` and `published` articles SHALL remain eligible

#### Scenario: A mutable or mismatched input arrives
- **WHEN** an input names another repository or branch, a mutable ref, a malformed hash or a mismatched dispatch id
- **THEN** validation MUST fail before checkout, build or deployment

### Requirement: Deployment SHALL verify the exact sanitized snapshot
The system MUST match the manifest to the exact sorted Markdown file set and each file's bytes, hash, slug, title and status while rejecting content outside the publication boundary.

#### Scenario: Publication content was changed after export
- **WHEN** a file is added, removed or changed relative to the immutable manifest
- **THEN** validation MUST fail before the site build

#### Scenario: Publication content contains blocked data
- **WHEN** content contains a draft, wrong target, secret-like metadata, conflict state, symlink, non-Markdown file or local media
- **THEN** validation MUST fail without writing to the content checkout

### Requirement: Preview and production artifacts SHALL be distinct and mode-verified
The system MUST verify and deploy a noindex preview before production, then rebuild production output from the same immutable sources with indexable metadata and strict assets.

#### Scenario: Preview output is reused as production
- **WHEN** production validation receives HTML or robots rules carrying preview noindex policy
- **THEN** it MUST reject the artifact before upload

#### Scenario: A production candidate becomes stale
- **WHEN** framework main or the publication branch advances before production upload
- **THEN** the workflow MUST reject the older candidate

### Requirement: Production deployment SHALL be serialized and credential-safe
The system MUST serialize production uploads per Pages project without canceling an upload in progress, use read-only repository permissions, and keep credential values out of outputs and deployment records.

#### Scenario: Local validation runs without deployment secrets
- **WHEN** tests, schema checks or shell syntax checks execute locally or in offline CI
- **THEN** they SHALL complete without Cloudflare credentials or the private publication deploy key

#### Scenario: Multiple current candidates reach production
- **WHEN** production runs overlap for the same Pages project
- **THEN** only one upload SHALL run at a time and queued runs SHALL recheck freshness
