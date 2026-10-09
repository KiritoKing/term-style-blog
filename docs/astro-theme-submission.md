# Astro Themes submission material

Status: source/material and anonymous synthetic demo prepared; **not submitted**. Maintainer Portal authentication/OAuth/submission and admin review remain required.

The [official astro.build repository](https://github.com/withastro/astro.build#updating-themes) directs theme authors to the [Astro Portal](https://portal.astro.build/themes/submit). Use Portal submission/update, not a theme-data pull request against astro.build. The maintainer handles GitHub login/OAuth and catalogue approval; the authenticated form fields have not been inspected in this Cloud session. Adapt the text below to the actual form rather than claiming a verified field schema.

## Suggested entry

**Name:** Terminal Blog

**Short description:** A free Astro blog theme with a retro terminal interface, typed configuration, Markdown posts, search, and a keyboard-friendly image viewer.

**Repository / download:** https://github.com/KiritoKing/term-style-blog

**Live demo:** https://public-demo.term-style-blog-demo.pages.dev/

**License / price:** MIT source and synthetic demo content; free. Preserve copyright and third-party notices. Authors configure their own real article license independently.

**Suggested categories/tags, if available:** Blog, Markdown, React, Tailwind CSS, TypeScript, Terminal.

**Description:**

Terminal Blog combines a pixel-inspired shell with responsive long-form reading. Readers can use regular links or terminal-style commands to browse posts and search a Pagefind index. It includes light/dark and reading modes, article tables of contents, highlighted code, Mermaid diagrams, tags, categories, pagination, an archive, RSS and sitemap output. Body images open in a native dialog with zoom, pan, fit and keyboard dismissal. Customize the site identity, About, network links and terminal prompt in one typed configuration file. Giscus and historical redirects are optional and disabled in the neutral starter. The theme builds static HTML from local Markdown; it requires no hosted CMS account or private services.

**Installation:** Node.js 22.12+ or 24, pnpm 10.28.0. Clone the repository, install with `pnpm install --frozen-lockfile`, and run `pnpm dev`. Edit `site.config.ts` and replace `src/content/blog/`. Set `SITE_URL` and `PUBLIC_DEPLOYMENT_ENV=production`, run `pnpm build`, and upload `dist/` to your static host. Detailed instructions: [getting started](getting-started.md).

## Screenshots

These four original screenshots show only the neutral profile and synthetic demo posts/assets. Use the files themselves for upload; combined size is 384,752 bytes (below 8 MB).

1. [Homepage, desktop dark](images/terminal-blog.png)
2. [Article, desktop light](images/article-light.png)
3. [Article, mobile dark](images/mobile-dark.png)
4. [Image viewer, desktop light](images/viewer-light.png)

The landscape fixture uses the neutral `guest@blog` identity inside its pixels. Its 1600×900 size and every pixel outside the title region are preserved. The public verifier compares both demo PNGs byte-for-byte against the reviewed build at the immutable origin and stable alias; HTML metadata alone cannot detect stale or personalized image pixels.

## Accepted independent public demo

[Anonymous neutral homepage](https://public-demo.term-style-blog-demo.pages.dev/) · [body-image interactions](https://public-demo.term-style-blog-demo.pages.dev/posts/image-lightbox-demo/).

The owner explicitly authorized dedicated Pages project `term-style-blog-demo`. Controlled Actions used the existing Pages capability, checked 7 existing projects before creation (limit 100), and uploaded only 161 static files (largest: 662,087 bytes) with no Functions or paid-plan request. Production branch `reserved-public-demo-20261009` remains unused; only preview branch `public-demo` is uploaded. The existing `notion-astro-rev` blog and protected review preview/Access are unchanged.

Reviewed dependency integration acceptance binds bd42568c161243c3bad2668b7e9475b11392e6cf to [run37907255584](https://github.com/KiritoKing/term-style-blog/actions/runs/37907255584) and immutable [hash deployment](https://4662320b.term-style-blog-demo.pages.dev/). Native HTTPS checks all 25 HTML routes, stable alias, exact SHA/noindex/neutral identity and images; Chromium at 1440/390 px in light/dark mode validates zoom/pan/pinch/fit/Escape/focus/repeat/Astro navigation and linked images. The final reviewed dependency integration and documentation head receives its own fresh acceptance; see [draft PR #25](https://github.com/KiritoKing/term-style-blog/pull/25) for current fullSHA/evidence.

The demo uses `PUBLIC_DEPLOYMENT_ENV=preview` with noindex to avoid indexing example posts. Noindex is a crawler instruction, not confidentiality protection. Its public/synthetic content is reviewed independently of private publication snapshots. No new credential, scope, DNS, Access policy, OAuth or production-blog operation occurred.

## Before maintainer submission

- Review and merge the independent source PR only when ready; this task never merges it.
- Confirm the current accepted public demo SHA/URL and review the stacked source/dependency PRs.
- Recheck dependency review and screenshot size/attribution.
- Log into Portal personally, inspect its current form, submit the accurate repository/demo URLs and up to four screenshots, and complete any admin review.
