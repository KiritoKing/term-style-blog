# Why
The Cloudflare credential migration introduced a custom Python resolver and CLI installer even though Bitwarden maintains a GitHub Action.

# What Changes
Use the pinned official Action and pass its masked output only to Cloudflare consumers. Remove CI resolver code and keep local fnox configuration. Preserve publication triggers, immutable inputs, acceptance, serialization and conditional recovery.

# Capabilities
## New Capabilities
None.
## Modified Capabilities
- ci-workflow-roles: use the official BSM integration with step-scoped credentials.

# Impact
Cloudflare workflows, credential documentation and deployment contract tests. No package changes, account policy changes or application deployment.
