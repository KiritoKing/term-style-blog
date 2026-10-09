# Dependency and source review — 2026-10-09

Astro is updated from 7.3.2 to **7.3.8**, the stable patch published on October 8 ([official release](https://github.com/withastro/astro/releases/tag/astro%407.3.8)). Markdown Remark is 7.3.2 and Sharp 0.35.5. A targeted `pnpm update --depth 100 devalue dompurify fast-uri smol-toml source-map-js postcss-selector-parser katex` refreshes only versions permitted by the existing dependency ranges. React remains 19, TypeScript 5.9 and Tailwind 4; no forced major overrides or new runtime packages are introduced.

`pnpm audit --json` initially reported 16 advisories (6 high, 6 moderate, 4 low). After the compatible updates it reports **4** (1 high, 2 moderate, 1 low; no critical). Audit is not clean. Remaining paths:

| Dependency path | Advisory / status | Assessment for this static theme |
| --- | --- | --- |
| Astro → http-cache-semantics 4.2.0 | [GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp), high; no patched version listed | The theme produces static HTML, not a multi-user HTTP cache server. Astro's build-time remote-image cache still warrants upstream monitoring; do not generalize this assessment to SSR/shared caches. |
| gray-matter → js-yaml → argparse → sprintf-js 1.0.3 | [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c), moderate; no patched version listed | Trusted local Markdown is parsed at build time. No user-supplied printf format endpoint is exposed; this does not eliminate the dependency advisory. |
| Mermaid → KaTeX 0.16.47 | [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7), low; patched in 0.18.2 | Fix exceeds Mermaid's declared range. Mermaid remains in strict mode; no independent math plugin is claimed. Review an upstream compatible Mermaid upgrade separately. |
| Tailwind typography → postcss-selector-parser 6.0.10 | [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf), moderate; patched in 7.1.6 | Build-time project CSS, not a public selector-parsing API. Keep the used typography plugin; do not override a major version without compatibility review. |

Reachability observations are an assessment of the current static architecture, not proof that every vulnerability is unreachable. Re-run audit before release; advisories and fixes change. pnpm continues to block the new esbuild 0.28.2 install script; frozen installation and actual checks/builds work using its platform package without enabling additional lifecycle scripts.

Source/asset review uses pinned **Gitleaks 8.28.0**, checksum-verified against the official release, with `--redact=100 --max-archive-depth=2`. Candidate tracked/unignored source and all 63 available Git commits were scanned separately; both returned 0 findings. The scanner did not read home credentials, external vaults, private snapshots or Actions secrets. A clean scan does not prove absence of every possible secret. Existing public Giscus IDs, domain configuration and synthetic invalid-token fixtures are not credentials.

Original demo posts, public geometric images and the four current neutral theme screenshots are covered by the source MIT grant. The original copyright and Astro/Neofetch notices remain. There are no redistributed custom font files. Actual owner article content and historical personal screenshots retain their own licensing; source publication does not relicense them.
