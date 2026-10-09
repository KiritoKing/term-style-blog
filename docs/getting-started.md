# Configuration and deployment / 配置与部署

This reusable terminal blog theme starts with neutral synthetic content. The original owner's publication profile is preserved separately; private infrastructure is not needed to run a fork.

## Local content

Use Node.js 22.12+ or 24 and pnpm 10.28.0. Run the [README quick start](../README.md). The bundled demo collection is `src/content/blog/`; `src/fixtures/blog/` is a separate test fixture set, not the default publishing folder.

The CLI validators run before Astro. Export build variables in the shell or CI process; copying `.env.example` alone does not configure the Node/tsx validation scripts. No `.env` file is required for the default demo.

```sh
CONTENT_DIR=/absolute/path/to/published \
EXPECTED_CONTENT_COUNT=3 \
PUBLIC_DEPLOYMENT_ENV=preview \
STRICT_CONTENT_ASSETS=1 \
pnpm build:content
```

Set `EXPECTED_CONTENT_COUNT` to your own expected count or omit it. The directory must contain only approved Markdown, including nested files. Read the [content contract](content.md) before pointing the build at your own notes.

## Configure a fork in one file

Edit the `template` profile in [`site.config.ts`](../site.config.ts). Existing components import this configuration through their data wrappers; you do not need to edit the shell or article components.

| Configuration | Purpose |
| --- | --- |
| `site` | Origin, title, subtitle, description, author, public author URL (`github`), language and article-content license |
| `terminal` | Username and hostname shared by the top bar, prompt, `pwd`, `cd` and `whoami` |
| `about`, `network` | Biography, skills and typed public links; an empty network hides the panel |
| `giscus` | `null` disables comments entirely; enable with your own public repo/category IDs and language |
| `redirectsFile` | `null` emits no historical redirects; otherwise a repository-relative JSON map of exact slug to alias arrays |
| `remoteImages` | Allowed HTTPS image hosts for Astro image processing; direct remote body images keep lazy loading |

Replace the Markdown demo collection and `public/favicon.svg`/`.ico`. Preserve LICENSE/NOTICE copyright when distributing source.

`SITE_PROFILE` defaults to `template`; unknown profiles fail the build. `SITE_URL` optionally overrides the selected origin and must be an HTTPS origin (HTTP localhost is allowed for development), with no credentials, path, query or fragment. Export variables in the shell: `.env` alone is not read by the prebuild validators. For example:

```sh
SITE_URL=https://blog.example.org PUBLIC_DEPLOYMENT_ENV=preview pnpm build
```

Giscus IDs are public configuration, not secrets. Enable GitHub Discussions for your own repository using [Giscus setup](https://giscus.app/), paste the generated repo/category IDs into `giscus`, and configure allowed origins before inviting comments. Pathname mapping and same-origin terminal light/dark theme CSS remain available. No script or iframe is emitted when comments are off.

`pnpm build` generates ignored `public/_redirects` from the selected map. An example map is `{ "hello-world": ["/old/hello"] }`; do not edit generated rules. The unchanged `scripts/historical-url-map.json` belongs to the owner's `chlorine` profile and is not inherited by a fresh template.

### Preserved owner profile

`SITE_PROFILE=chlorine` retains chlorinec.top, ChlorineC's metadata/About/network, the existing Giscus repository/category, article license, image hosts and all 162 historical aliases. Both build jobs in the protected publication workflow explicitly select it. The framework's default template changes neither the private source nor the immutable publication protocol. To check this profile without private content, run:

```sh
SITE_PROFILE=chlorine PUBLIC_DEPLOYMENT_ENV=preview pnpm build
SITE_PROFILE=chlorine pnpm test:e2e
```

## Static hosting

`pnpm build` produces `dist/` and its Pagefind index. For a site intended to be indexed, explicitly set `PUBLIC_DEPLOYMENT_ENV=production`; previews use `PUBLIC_DEPLOYMENT_ENV=preview` and emit `noindex` and disallow-all robots. Do not mistake those crawler directives for privacy controls.

After configuring the template and validating your own content:

```sh
SITE_URL=https://blog.example.org \
CONTENT_DIR=/absolute/path/to/published \
PUBLIC_DEPLOYMENT_ENV=production \
STRICT_CONTENT_ASSETS=1 \
pnpm build:content
```

Upload `dist/` to your chosen static host. Cloudflare Pages understands the generated `_redirects`; other hosts need equivalent permanent redirect rules. Validate actual HTTP redirects, RSS, sitemap, robots and mobile rendering after deployment. Keep a previous deployment available for rollback.

## The author's automated pipeline

```text
Mac / mobile ── Obsidian Sync ── Hermes headless vault
                                      │ read only
                                      ▼
                              sanitized snapshot export
                                      │ isolated Git branch
                                      ▼
                            immutable repository_dispatch
                                      │
                                      ▼
                     metadata / assets / tests / static build
                                      │
                                      ▼
                         Cloudflare Pages preview + review
```

Obsidian Sync is the vault synchronization service. Git is a one-way output of the exporter, not another writer of the live vault. The exporter runs outside this framework repository; it is not installed by cloning this project.

`.github/workflows/deploy-publication.yml` is deliberately personal. It only runs on `KiritoKing/term-style-blog` main, accepts the fixed publication repository/branch, and verifies full framework/content SHAs, a manifest digest and a source-tree digest. Forks should create their own deployment workflow and content boundary rather than simply removing the guard.

The owner workflow uses these **GitHub Actions** settings:

| Setting | Kind | Purpose |
| --- | --- | --- |
| `VAULT_CONTENTS_READ_KEY` | Secret | Read-only SSH deploy key for the private publication repository |
| `CLOUDFLARE_API_TOKEN` | Secret | Dedicated Pages deployment access |
| `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` | Secrets | Dedicated Service Auth token for protected preview acceptance; both required together |
| `CLOUDFLARE_ACCOUNT_ID` | Variable | Target account identifier |
| `CLOUDFLARE_PAGES_PROJECT` | Variable | Pages project name |
| `PUBLICATION_PRODUCTION_ENABLED` | Variable | Defaults to `false` |
| `PUBLICATION_PREVIEW_REVIEW` | Variable | Defaults to `manual` |

The production site is already live. The authorized automatic path requires `true/automatic`, a Service Auth policy limited to the preview application, and successful immutable hosted acceptance of every generated HTML page. It then promotes the separately verified production artifact and checks the public canonical domain. Default `false/manual` remains safe for unconfigured installations; opening the source repository does not open the vault or enable production. See [trigger map, recovery and retry rules](publication-pipeline.md).

Public Actions logs/artifacts are public surfaces. Send only content that is safe to disclose to this repository's workflow; keep private drafts in the vault. Browser traces and visual-audit output may include full page content and should be reviewed before sharing.

## CI roles

`CI` validates pull requests and main commits using demo Markdown; it does not publish content. `Blog publish (Cloudflare)` handles owner main updates, explicit immutable content events or manual dispatch. Main updates reuse the accepted public production content reference and revalidate its immutable snapshot; PRs never enter publication. GitHub-managed CodeQL scans source, while Dependabot maintains dependency PRs. Routine npm minor/patch and Actions updates are grouped for Monday09:00 Asia/Shanghai; security updates remain enabled independently of that routine schedule. Historical runs remain available as audit evidence.

The old Vercel demo is disabled through [`vercel.json`](../vercel.json), using the supported [Git deployment opt-out](https://vercel.com/docs/project-configuration/git-configuration). CodeQL language jobs and Dependabot updater jobs are security/maintenance activity, not additional blog deployments.

For the verified Sync/timer/GitHub event sequence, read [publication triggers and ownership](publication-pipeline.md).

## Maintainer public catalogue demo

[The independent demo](https://public-demo.term-style-blog-demo.pages.dev/) uses the neutral synthetic repository collection and preview/noindex output. `.github/workflows/public-theme-demo.yml` runs only on the explicitly authorized owned feature branch, validates a full source SHA/artifact, checks existing Pages quota/free static limits and uploads preview branch `public-demo` in dedicated project `term-style-blog-demo`. Its reserved production branch is never uploaded. Anonymous verification uses a separate project-only origin guard, no Access headers, bounded secure TLS propagation and all-route/browser/image proof.

This workflow does not replace the owner publication pipeline or authorize PR/fork secrets. The existing blog/Access/private snapshot duties stay; no credential values are read into local development. A fresh clone does not need this maintainer-only infrastructure. Current source SHA/CI/hash URL are recorded in [PR #25](https://github.com/KiritoKing/term-style-blog/pull/25). Maintainer handles all merges and Portal OAuth/submission personally.
