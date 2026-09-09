# Changelog

## 1.0.0 — 2026-09-09

First open-source release of ChlorineC's deployed terminal-style blog.

- Astro static pages with React terminal interactions and responsive reading modes.
- Obsidian/Markdown publication snapshots with strict metadata and content integrity checks.
- Pagefind search, Giscus comments, taxonomy/archive pages, RSS, sitemap, SEO and historical redirects.
- Mermaid rendering, syntax highlighting, article navigation and mobile layout fixes.
- Secret-free local demo, fixture CI and a guarded personal Cloudflare publication workflow.
- MIT source license, third-party notices, bilingual README and contribution/security guides.

The live site and private publication source remain separate from the open-source repository. Automatic content changes currently produce manual-review previews; this release does not enable automatic production deployment.

### Security

- Upgrade Astro to 7.3.2 and compatible Markdown, React, image and build dependencies; retain unified rendering and prior inline-whitespace behavior. Node.js 22.12+ is now required.
- Dependency audit reports no known vulnerabilities at release validation time.
