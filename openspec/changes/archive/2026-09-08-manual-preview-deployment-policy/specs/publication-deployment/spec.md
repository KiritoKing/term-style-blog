## MODIFIED Requirements

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
