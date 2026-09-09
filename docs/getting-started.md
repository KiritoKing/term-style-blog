# Configuration and deployment / 配置与部署

This is the source of a personal site. Local development is self-contained; the owner's private publication infrastructure is not needed to run a fork.

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

## Change these before publishing a fork

| File | What to replace |
| --- | --- |
| `astro.config.mjs` | `site` origin and allowed remote image hosts |
| `src/lib/site.ts` | Origin, title, author, description, GitHub URL and your article license |
| `src/data/about.ts`, `src/data/network.ts` | Personal biography and links |
| `src/components/shell/Sidebar.astro` | Visible author name |
| `src/pages/posts/[id].astro` | Giscus repository/category IDs and themes; connect your own discussion repository |
| `scripts/historical-url-map.json` | Your redirects; use `{}` when you have no historical routes |
| `vercel.json` | The author disabled the old Vercel demo’s automatic Git deployments; change this explicit opt-out if your fork intentionally uses Vercel Git integration |
| `public/favicon.svg`, `public/favicon.ico` | Your site icon |
| `src/content/blog/` | Replace demo posts or use external `CONTENT_DIR` |

Keep the two site origins consistent. `pnpm build` regenerates `public/_redirects` from the historical map, so do not maintain generated rules by hand. This repository's old aliases deliberately refer to the author's own posts and are not meaningful in a fresh fork.

Giscus IDs are public configuration, not secrets. Configure Giscus for your own repository and domain before inviting comments; leaving the author's settings is not a shared comment service. The site has no authentication server or CMS backend.

## Static hosting

`pnpm build` produces `dist/` and its Pagefind index. For a site intended to be indexed, explicitly set `PUBLIC_DEPLOYMENT_ENV=production`; previews use `PUBLIC_DEPLOYMENT_ENV=preview` and emit `noindex` and disallow-all robots. Do not mistake those crawler directives for privacy controls.

After changing personal settings and validating your own content:

```sh
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
| `CLOUDFLARE_ACCOUNT_ID` | Variable | Target account identifier |
| `CLOUDFLARE_PAGES_PROJECT` | Variable | Pages project name |
| `PUBLICATION_PRODUCTION_ENABLED` | Variable | Defaults to `false` |
| `PUBLICATION_PREVIEW_REVIEW` | Variable | Defaults to `manual` |

The production site is already live. New content events currently create previews for human review. Automatic production requires both explicit enabling and successful automated online preview verification; a preview behind Access cannot be accepted by treating its login page as blog HTML. Opening the source repository does not open the vault or enable automatic production.

Public Actions logs/artifacts are public surfaces. Send only content that is safe to disclose to this repository's workflow; keep private drafts in the vault. Browser traces and visual-audit output may include full page content and should be reviewed before sharing.

## CI roles

`CI` validates pull requests and main commits using demo Markdown; it does not publish content. `Blog publish (Cloudflare)` handles explicit immutable content events or manual dispatch. GitHub-managed CodeQL scans source, while Dependabot maintains dependency PRs. Routine npm minor/patch and Actions updates are grouped for Monday09:00 Asia/Shanghai; security updates remain enabled independently of that routine schedule. Historical runs remain available as audit evidence.

The old Vercel demo is disabled through [`vercel.json`](../vercel.json), using the supported [Git deployment opt-out](https://vercel.com/docs/project-configuration/git-configuration). CodeQL language jobs and Dependabot updater jobs are security/maintenance activity, not additional blog deployments.

For the verified Sync/timer/GitHub event sequence, read [publication triggers and ownership](publication-pipeline.md).
