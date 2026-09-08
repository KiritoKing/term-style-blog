# Design

## Immutable inputs

Automatic dispatch accepts only `KiritoKing/llm-obsidian`, branch `publish-snapshots`, a full content commit SHA, the manifest SHA-256, the publisher-compatible `source_tree_hash`, and a dispatch id bound to the content SHA. The framework is checked out at the event SHA. Manual preview accepts the same immutable content inputs; a manual production retry is allowed only from framework `main`.

The validator has no package dependency. It verifies the exact manifest schema, exact sorted Markdown file set, file bytes and SHA-256 values, publisher tree hash, frontmatter identity, portable unique slugs and the approved `publish` plus `published` states. It rejects drafts, wrong targets, symlinks, non-Markdown files, conflict state, credential-like metadata and local or embedded media.

## Preview and production separation

The workflow builds with preview metadata, checks the generated site is `noindex`, runs the real browser acceptance and deploys a content-SHA-named preview. Production mode proceeds only after that preview responds correctly. It deletes preview output, rebuilds from the same immutable inputs with `PUBLIC_DEPLOYMENT_ENV=production` and strict assets, and requires indexable output. The validator explicitly rejects presenting preview `noindex` HTML as production.

Only the separately rebuilt production directory crosses jobs. The production job revalidates its mode and source, checks framework `main` and publication branch tips still match the candidate, then enters a project-scoped concurrency group with cancellation disabled.

## Credential and output boundary

Local validator tests, YAML parsing and shell syntax checks do not read Cloudflare or GitHub secrets. Workflow permissions are read-only. The publication deploy key and Cloudflare token are referenced only by runtime deployment checkouts/actions. Outputs and the deployment record contain immutable IDs and hashes, not credential values. Cloudflare account and project come from repository variables, with the accepted project fallback.

## Integration tests

The Node suite covers valid and tampered snapshots, source scope, both approved statuses, trigger normalization, immutable ref rejection, preview/production mode separation, dependency pins, serialization and read-only permissions. `test:deployment` runs it directly. Offline CI and the deployment workflow invoke this script explicitly because Vitest does not discover the `.mjs` Node suite.

Static integration validation parses both workflows as YAML, syntax-checks every `run` block with Bash, checks action refs and script references, and does not run a build or deployment.
