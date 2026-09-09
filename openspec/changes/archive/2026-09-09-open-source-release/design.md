# Design

This remains ChlorineC's personal Astro blog, with reusable source rather than a generic hosted CMS. Default clone commands use the included Markdown demo collection and require no Obsidian account, Notion token or deployment credentials. Live articles stay in the private publication repository.

MIT covers original source, fixtures and documentation. Preserve third-party notices; separately identify blog content and personal identity as outside the source grant. Verify provenance before choosing final notices.

Root owns shared package/workflow/doc files and repository writes. Two read-only reviewers independently audit sensitive exposure and third-party provenance, writing reports only outside the repository. Product changes are limited to the security compatibility migration recorded below; no production deployment is planned. A pinned, read-only PR workflow runs fixtures; the secret-bearing publication workflow is limited to this repository's main ref and never runs on pull requests.

Validation precedes public visibility: review all remote branches/tags and PR surfaces, redacted history/log scans, package install/build/type/unit/deployment/browser gates, documentation links and schemas. Repository settings enable security reporting and scanning when available; no auto-merge or automated production is enabled. Record pre-change settings for recovery and exact source/release SHA.

Provenance review found an unused machine-local Notion loader override in pnpm-workspace.yaml and pnpm-lock.yaml. Extend the root-only configuration scope to remove that override with an initial frozen-install check; the later security migration below also updates the resolved dependency graph. Preserve notices for inline OS ASCII artwork as well as starter assets.

Repository-wide spec verification found a pre-existing tdd-governance header shape mismatch (Overview/ADDED Requirements in an active spec). Correct the active-spec headings, attach the existing scenarios to their matching requirements, and add equivalent MUST keywords plus design/fixture scenarios; retain the existing governance policy.

The active test-harness specification still described removed isLocalValidation mocks and production Notion reads. Align that documentation with the existing source selection and fixture tests: demo source in src/content/blog, independent schema fixtures in src/fixtures/blog, explicit CONTENT_DIR for external builds and no Notion API path. This records already implemented behavior rather than adding a content source.

Security audit identified vulnerable dependencies. The authorized release scope includes a bounded upgrade to Astro 7.3.2, its React/unified integrations, Sharp and compatible toolchain dependencies. Root integrates only package.json, pnpm-lock.yaml, astro.config.mjs and the two fixture ZodError accessors from the isolated spike; explicitly preserve compressHTML: true. Require Node 22.12+ or 24, zero reported audit vulnerabilities and a full 53-post/26-test real-content regression before publication. Existing production remains untouched.
