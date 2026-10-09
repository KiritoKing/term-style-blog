# Astro Themes submission material

Status: prepared source/material; **not submitted**. Maintainer authentication and a public no-login demo remain required.

The [official astro.build repository](https://github.com/withastro/astro.build#updating-themes) directs theme authors to the [Astro Portal](https://portal.astro.build/themes/submit). Use Portal submission/update, not a theme-data pull request against astro.build. The maintainer handles GitHub login/OAuth and catalogue approval; the authenticated form fields have not been inspected in this Cloud session. Adapt the text below to the actual form rather than claiming a verified field schema.

## Suggested entry

**Name:** Terminal Blog

**Short description:** A free Astro blog theme with a retro terminal interface, typed configuration, Markdown posts, search, and a keyboard-friendly image viewer.

**Repository / download:** https://github.com/KiritoKing/term-style-blog

**License / price:** MIT source and synthetic demo content; free. Preserve copyright and third-party notices. Authors configure their own real article license independently.

**Suggested categories/tags, if available:** Blog, Markdown, React, Tailwind CSS, TypeScript, Terminal.

**Description:**

Terminal Blog combines a pixel-inspired shell with responsive long-form reading. Readers can use regular links or terminal-style commands to browse posts and search a Pagefind index. It includes light/dark and reading modes, article tables of contents, highlighted code, Mermaid diagrams, tags, categories, pagination, an archive, RSS and sitemap output. Body images open in a native dialog with zoom, pan, fit and keyboard dismissal. Customize the site identity, About, network links and terminal prompt in one typed configuration file. Giscus and historical redirects are optional and disabled in the neutral starter. The theme builds static HTML from local Markdown; it requires no hosted CMS account or private services.

**Installation:** Node.js 22.12+ or 24, pnpm 10.28.0. Clone the repository, install with `pnpm install --frozen-lockfile`, and run `pnpm dev`. Edit `site.config.ts` and replace `src/content/blog/`. Set `SITE_URL` and `PUBLIC_DEPLOYMENT_ENV=production`, run `pnpm build`, and upload `dist/` to your static host. Detailed instructions: [getting started](getting-started.md).

## Screenshots

These four original screenshots show only the neutral profile and synthetic demo posts/assets. Use the files themselves for upload; combined size is 385,087 bytes (below 8 MB).

1. [Homepage, desktop dark](images/terminal-blog.png)
2. [Article, desktop light](images/article-light.png)
3. [Article, mobile dark](images/mobile-dark.png)
4. [Image viewer, desktop light](images/viewer-light.png)

## Public demo prerequisite

The existing authorized `notion-astro-rev` **review preview remains Access-protected**. It is useful for SHA-bound acceptance but is not a public no-login demo and must not be entered as one in the catalogue. Do not enter the owner's production blog as the neutral demo.

Minimal remaining setup: maintainer approves/provides a separate public static-hosting target, such as an independent Pages project restricted to the synthetic template artifact, with no private snapshot, Access change or production branch. The maintainer must confirm any required existing token scope/project access; this task does not expand credentials, create services or modify Access policies. Once configured, build the same reviewed SHA with the chosen public origin, verify anonymous HTTP/browser access and synthetic/noindex output, then supply that URL in Portal.

The public demo can remain `PUBLIC_DEPLOYMENT_ENV=preview` to avoid indexing example posts. Noindex is a crawler instruction, not confidentiality protection.

## Before maintainer submission

- Review and merge the independent source PR only when ready; this task never merges it.
- Resolve the public-hosting prerequisite, verify the exact reviewed commit and confirm anonymous access.
- Recheck dependency review and screenshot size/attribution.
- Log into Portal personally, inspect its current form, submit the accurate repository/demo URLs and up to four screenshots, and complete any admin review.
