# publication-deployment Specification

## Purpose
TBD - created by archiving change integrate-publication-deployment. Update Purpose after archive.
## Requirements
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
The system MUST default publication events to a noindex manual-review preview. It MUST verify the exact immutable snapshot, strict content assets and local preview artifact before deployment, and MUST not build production unless production is explicitly enabled and automated online preview verification succeeds.

#### Scenario: Default automatic publication event creates a manual preview
- **WHEN** a valid `content_published_changed` event arrives without explicit policy variables
- **THEN** the workflow SHALL resolve to preview with manual review
- **THEN** it SHALL validate and deploy the immutable noindex preview
- **THEN** it SHALL record human online acceptance as pending without fetching the preview URL

#### Scenario: Manual preview is protected by Access
- **WHEN** Cloudflare returns a successful preview deployment under manual-review policy
- **THEN** the deployment response SHALL be validated without treating an Access login response as verified blog output
- **THEN** production SHALL remain blocked pending human acceptance and a later authorized policy change

#### Scenario: Automatic production is explicitly enabled
- **WHEN** production is exactly enabled and preview review is explicitly automatic
- **THEN** the workflow SHALL verify the deployed preview HTML and robots policy before rebuilding production from the same immutable sources

#### Scenario: Preview output is reused as production
- **WHEN** production validation receives HTML or robots rules carrying preview noindex policy
- **THEN** it MUST reject the artifact before upload

#### Scenario: A production candidate becomes stale
- **WHEN** framework main or the publication branch advances before production upload
- **THEN** the workflow MUST reject the older candidate

### Requirement: Production deployment SHALL be serialized and credential-safe
The system MUST keep production disabled by default, reject production retry unless production is exactly enabled with automatic preview review, serialize enabled production uploads per Pages project without canceling an upload in progress, use read-only repository permissions, and keep credential values out of outputs and deployment records.

#### Scenario: Production retry is requested under the default policy
- **WHEN** a manual `production-retry` is requested while production is not exactly enabled or preview review is manual
- **THEN** validation MUST fail before checkout, build or deployment

#### Scenario: Local validation runs without deployment secrets
- **WHEN** tests, schema checks or shell syntax checks execute locally or in offline CI
- **THEN** they SHALL complete without Cloudflare credentials or the private publication deploy key

#### Scenario: Multiple current candidates reach production
- **WHEN** enabled production runs overlap for the same Pages project
- **THEN** only one upload SHALL run at a time and queued runs SHALL recheck freshness

### Requirement: Snapshot validation SHALL preserve exporter schema-v1 hash compatibility
The consumer MUST validate `source_tree_hash` using the established exporter schema-v1 serialization order `slug,status,title,path,bytes,sha256` over files globally sorted by relative path, without changing the producer or accepting malformed or modified snapshots.

#### Scenario: An exporter-v1 snapshot is validated
- **WHEN** a synthetic snapshot produced by the actual Deno exporter contains both public statuses, Unicode, nested paths and path-prefix siblings
- **THEN** the consumer SHALL match the exact manifest bytes and source-tree hash
- **THEN** it SHALL report the exact file and status counts

#### Scenario: Recursive traversal order differs from global path order
- **WHEN** the snapshot contains both `a.md` and `a/child.md`
- **THEN** the consumer SHALL compare and hash files in globally sorted relative-path order

#### Scenario: A v1 snapshot is malformed or tampered
- **WHEN** a manifest hash, entry hash, file byte or metadata value does not match the immutable snapshot
- **THEN** validation MUST fail before build or deployment

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
