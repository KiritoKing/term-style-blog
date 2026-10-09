## Context

Main is 7577a11e; PR24 supplies neutral configuration at afb1a845. Existing protected Pages guards intentionally accept only notion-astro-rev. The owner authorized one separate public project and dependency reviews, without automatic merge or wider permissions.

## Goals / Non-Goals

**Goals:** anonymously accessible static synthetic demo, bounded existing-account creation, exact SHA evidence and desktop/mobile/theme/image acceptance.

**Non-Goals:** private content, owner blog changes, production uploads, Access changes, new credentials, OAuth, DNS or paid plans.

## Decisions

- Stack an independent feature branch on PR24. Its push-only owned-repository workflow tests without secrets, stamps the full checkout SHA and uploads a validated artifact. CI retains both profiles.
- Use fixed project `term-style-blog-demo`, production branch `reserved-public-demo-20261009`, preview branch `public-demo`. A new API helper uses the existing token only within controlled Actions, checks paginated project count below the documented 100-project soft limit and accepts only the dedicated project contract on reruns. No raw API response or credential reaches logs/artifacts.
- Refuse Functions, native payloads, symlinks, 20,000+ files or assets above 25 MiB. The project has no source integration or runtime bindings. Creation never upgrades a plan; permission or quota errors stop.
- Keep the protected verifier unchanged. A separate anonymous verifier accepts only this new Pages project, rejects any Access credential in its environment, follows no redirects, checks every HTML route, local image status and immutable metadata, then exercises Chromium in four width/theme combinations.
- Use the stable preview alias as SITE_URL; retain hash deployment URL as immutable evidence. Source and workflow revision are the same exact SHA. No new browser dependency or code is shipped.

## Test Design

Node tests first cover fixed origin rejection (old project, production host, credentials, query and cross-origin URLs), quota/pagination, creation errors, pre-existing unsafe project, repeated safe reuse, asset limits and secret-free logs. Static workflow tests retain owner/push gates, artifact/SHA binding, synthetic content, noindex and non-production branch while forbidding private/Access/production settings. Existing unit, publication regression, Astro/TS and both profile E2E cover behavior; hosted Chromium additionally proves anonymous output and repeat/navigation/focus/image operation.

## Risks / Trade-offs

- Existing token may not authorize creation → fail with sanitized HTTP/error codes; report exact permission gap without changing credentials.
- Account policy may protect the new hostname → anonymous acceptance fails; do not remove Access.
- Public demo is intentionally readable and noindex is not privacy → only reviewed synthetic Markdown/assets are allowed.
- PR24 unmerged → stacked PR documents dependency; no automatic merge or retarget.

## Migration Plan

After local checks, push the bounded workflow, let controlled Actions check/create/deploy, inspect exact job evidence and anonymous URL. Keep production branch unused. Failed creation/deploy leaves existing projects unchanged; do not automatically delete a successfully created project or change Access.
