## ADDED Requirements

### Requirement: Cloudflare credentials SHALL use the official BSM Action with step scope
Cloudflare jobs MUST retrieve only the configured Engineer secret through a pinned official Bitwarden Action with environment export disabled. Only Cloudflare consumer steps SHALL receive its masked same-job output. Build-only jobs MUST remain credential-free, and existing publication and recovery conditions MUST remain unchanged. Local fnox configuration MAY remain independent of CI.

#### Scenario: A Cloudflare consumer needs a credential
- **WHEN** a permitted deployment or metadata operation reaches its credential step
- **THEN** the official Action SHALL retrieve the Engineer UUID using the sandbox bootstrap secret
- **THEN** only the explicit consumer SHALL receive the token through its input or environment

#### Scenario: Production acceptance fails after upload
- **WHEN** the existing conditional recovery gate permits rollback
- **THEN** the rollback step SHALL receive the same successfully retrieved credential without relying on global environment export

#### Scenario: Build or local contract validation runs
- **WHEN** a public fixture build or offline workflow test executes
- **THEN** it MUST NOT load BSM or Cloudflare credentials
