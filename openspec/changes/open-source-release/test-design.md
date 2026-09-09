# Test design

- Fixture integration: clean frozen install; test, deployment validation, Astro check, build and Chromium E2E without secrets or external content.
- Workflow boundary regression: require owner/main guard for publication, absence of pull_request_target, read-only CI token and immutable action refs.
- Documentation/config verification: package license/repository/version, YAML parsing, shell syntax, local links, environment example keys and ignored private files.
- Independent security/provenance review: all fetched remote refs, available public-facing history, logs/artifacts and bundled third-party assets; sanitized findings only.
- Remote acceptance: CI on exact SHA; public unauthenticated repository/release/license readback; private vault remains private; live blog remains healthy.
