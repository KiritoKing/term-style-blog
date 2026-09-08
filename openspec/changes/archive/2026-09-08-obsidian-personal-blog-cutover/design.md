# Design

## Source boundary

`CONTENT_DIR` points at the immutable `OUTPUT_ROOT/20-writing/published` directory produced by the publication snapshot exporter. Astro's content collection reads Markdown from that directory at build time. Local check and unit commands use the repository fixtures when the variable is absent; production CI invokes `build:content`, which requires the external directory and rejects zero entries. The schema requires `publish.target: blog` and a status of `publish` or `published`, so a draft accidentally placed in the snapshot fails instead of being silently exposed or skipped. Both approved states join the build: `publish` authorizes first publication and `published` authorizes continued updates. B01 produces local artifacts only and performs no external deployment or source status writeback.

The page model uses frontmatter directly. The public route segment is the trimmed `slug`; file names and source-system IDs never substitute for it. Duplicate slugs and conflict markers fail validation. Unresolved wikilinks degrade to their visible label. Local or malformed image references remain non-public and produce exact warnings in preview; production or `STRICT_CONTENT_ASSETS=1` validation rejects them. Already-public remote images remain ordinary lazy HTML images so a content build never downloads from the image host.

## Rendering

Astro renders Markdown into static HTML. A remark transform converts Obsidian wikilinks to `/posts/<slug>` links after validating the link target against the published slug set. Heading slugs remain stable through the Markdown pipeline. Mermaid fences remain source code in no-script contexts and are progressively enhanced in article pages. Raw HTML is rendered by Astro's Markdown pipeline; executable MDX is not enabled.

## Routes and discovery

The canonical article route stays `/posts/<exact-slug>`. The historical `migration/url-map.json` is copied as a public compatibility input and deterministically compiled to Cloudflare `_redirects`, retaining all 162 aliases. RSS, sitemap and robots are generated from the same public collection and site origin `https://chlorinec.top/`. The archive and previous/next links use the same date-sorted list.

## Metadata and comments

The shared layout receives page title, description, canonical URL and article metadata. It emits Chinese language metadata, Open Graph, Twitter and JSON-LD. The site identity is the verified historical identity: `ChlorineC's Blog`, author `ChlorineC`, subtitle `Coding With Passion`, GitHub `KiritoKing`, and CC BY-NC-SA 4.0.

Giscus stays bound to `KiritoKing/notion-astro-rev`, repository id `R_kgDONmCW3w`, category `Announcements`, category id `DIC_kwDONmCW384CpTzw`, and `pathname` mapping. Canonical article routes omit forced slash rewriting so existing discussion path keys remain stable.

## Terminal shell and mobile layout

Desktop retains Sidebar, TopBar, ContentFrame and TerminalPanel. On narrow screens the sidebar network block and terminal panel become collapsible, the content panel gets viewport-safe height, and article typography uses a system-readable Chinese font stack with horizontal overflow constrained to code/table containers. Reduced-motion disables flicker and scanlines independently of the existing accessibility toggle.

## Test design

- Unit: metadata normalization, exact slug route generation, content-source resolution, redirect generation and wikilink parsing.
- Fixture validation: valid `publish` and `published` entries, duplicate slug, wrong target, unresolved private wikilink, strict local-image and empty-source failures.
- Real corpus: run the validator and full content build against the read-only 53-file vault directory; assert 53 article routes, exact `KeePass`, three `publish` entries and 162 redirects.
- Browser: exercise posts navigation, terminal `help` and `cd`, Pagefind Chinese search, Giscus pathname attributes, metadata, historical redirect response, reduced motion and a 390px article viewport.
- OpenSpec: strict validation before implementation and after the delta specs are synchronized.
