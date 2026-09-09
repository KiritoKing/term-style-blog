# term-style-blog

[中文](README.md) · [Live blog](https://chlorinec.top) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)

[![CI](https://github.com/KiritoKing/term-style-blog/actions/workflows/ci.yml/badge.svg)](https://github.com/KiritoKing/term-style-blog/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An Astro static blog with a terminal-inspired interface, built with React, TypeScript and Tailwind CSS. This is the source of **ChlorineC's personal blog**: pixel typography and interactive commands alongside responsive long-form reading.

![Desktop terminal blog interface](docs/images/terminal-blog.png)

Features include light/dark and reading modes, terminal navigation, article TOC, code highlighting, Mermaid, Pagefind search, Giscus, tags, categories, archives, pagination, RSS, sitemap, SEO metadata and historical redirects.

This is a personal site with reusable source, not a general-purpose CMS. Forks are welcome; personal configuration remains explicit in the code.

## Quick start

Use **Node.js 22.12+ or 24** and **pnpm 10.28.0**. Included Markdown demo posts make local development independent of Obsidian, Notion, Cloudflare and deployment secrets.

```sh
git clone https://github.com/KiritoKing/term-style-blog.git
cd term-style-blog
corepack enable
corepack prepare pnpm@10.28.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by Astro, normally `http://localhost:4321`. If your Node distribution does not bundle Corepack, use an existing pnpm 10.28.0 installation.

```sh
pnpm test
pnpm test:deployment
pnpm check
pnpm build
pnpm preview
```

Pagefind needs a production build; test search with `pnpm build` followed by `pnpm preview`. For browser tests, install Chromium with `pnpm exec playwright install chromium`, then run `pnpm test:e2e` after building.

## Content and deployment

Demo content lives in `src/content/blog/`. To build your own publication directory:

```sh
CONTENT_DIR=/absolute/path/to/published \
PUBLIC_DEPLOYMENT_ENV=preview \
STRICT_CONTENT_ASSETS=1 \
pnpm build:content
```

Every Markdown file under that directory must be approved for publication and provide a stable slug, title, date, category, tags, summary, `status: publish|published` and `publish.target: blog`. Blank or placeholder categories, missing summaries, conflicts and duplicate slugs fail validation. See the [content contract](docs/content.md).

The author's pipeline is **Obsidian Sync → read-only Hermes exporter → isolated Git snapshot → GitHub Actions → protected Pages preview acceptance → production**. Git never pulls changes into the active vault. The actual vault and credentials remain private. The live site is deployed. With the explicit automatic policy enabled, approved content changes pass hosted page acceptance before production promotion; unconfigured installations default to manual preview. See [publication and recovery](docs/publication-pipeline.md).

**Before deploying a fork**, replace site origin and identity, about/network data, Giscus configuration and the historical URL map. The owner's publication workflow is intentionally gated to this repository's main branch. It is not a one-click deployment service for forks. See [configuration and deployment](docs/getting-started.md).

## Contributing and license

Focused bug fixes, reading improvements and documentation contributions are welcome. Discuss larger changes in an Issue first. Read [CONTRIBUTING](CONTRIBUTING.md), [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) and [SECURITY](SECURITY.md).

Original source, examples and documentation are available under the [MIT License](LICENSE). Third-party components retain their licenses; see [NOTICE](NOTICE.md). The source license does not relicense live articles, content visible in screenshots or external media. Personal identity and branding should be replaced in your fork.

Archived OpenSpec changes and agent reports preserve implementation history. Older Notion plans are historical; the current content source is Markdown.

[Publication triggers and ownership](docs/publication-pipeline.md)
