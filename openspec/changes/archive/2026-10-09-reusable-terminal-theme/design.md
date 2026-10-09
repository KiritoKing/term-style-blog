## Context
The default source build currently identifies the owner, enables their Discussions and emits their historical redirects. The public collection is synthetic; private publication is pinned and built only by guarded Actions. Astro is 7.3.8 (the schema context's Astro 5 note is historical).

## Goals / Non-Goals
Goals: one typed customization entry, neutral source defaults, preserved explicit owner profile, reproducible public builds and catalogue-ready original screenshots/documentation.
Non-goals: changing live production, private snapshots, content ingestion, Access, credentials, OAuth or submitting the catalogue entry.

## Decisions
- Root `site.config.ts` exposes typed template/owner profiles and validates profile/origin selection. Existing data wrappers preserve their import contracts; React receives only the terminal identity as props. No new browser script/dependency is needed.
- Default template disables Giscus and inherited redirects. The existing protected publication workflow explicitly selects `chlorine`, preserving its origin, author, license, comments and 162 aliases. Generated `_redirects` is no longer source-controlled; the owner source map remains unchanged.
- About, network, metadata and terminal commands share the same profile. Content licenses are configurable independently from the MIT source license.
- A separate owned feature-branch workflow builds synthetic content with noindex and publishes only to an existing Access-protected Pages preview branch using current controlled secrets. No private snapshot enters this workflow. Public catalogue hosting requires a parent-approved independent public target.
- Upgrade compatible patches; assess advisories by dependency path, do not force incompatible majors or claim audit is clean when unpatched advisories remain.

## Test design
Unit: neutral/default and owner profiles, origin rejection/override, owner Giscus and redirect preservation. Workflow static: owner-only gates unchanged, explicit profile, unprivileged synthetic CI jobs for both profiles, retaining the required verify context and isolated preview target. Fixture/build: frozen install, public collection and both profile outputs. Chromium e2e/axe smoke: metadata, terminal identity/navigation, comments absence/preserved mapping, template historical 404/owner 301, image viewer and mobile overflow. Documentation/license review: links, original synthetic assets and redacted tracked/history credential scan. OpenSpec validation before implementation and after sync.

## Risks / Trade-offs
[Changing defaults] → protected publication explicitly selects owner profile and synthetic owner-profile browser tests verify original contracts.
[Credential leakage] → scanner reports only redacted findings; Actions secrets remain in established jobs and exact-origin verification.
[Catalogue demo protected] → record blocker; parent chooses a public host without weakening private preview Access.
[Transitive advisories] → document remaining paths/reachability and apply only compatible updates.

## Migration Plan
Fork users edit `template` in one file, set SITE_URL and opt into comments/redirects. Owner builds select SITE_PROFILE=chlorine without changing content. Revert the PR to restore previous defaults. No live deployment is performed by this task.

## Open Questions
Parent must approve/provide a public no-login demo target and complete Portal login/admin submission.
