# OSS01 open-source release

Status: pass / done

## Outcome

The owner explicitly authorized the complete source-publication operation. The repository is public at https://github.com/KiritoKing/term-style-blog and the non-prerelease v1.0.0 is published at https://github.com/KiritoKing/term-style-blog/releases/tag/v1.0.0.

- Release source: `2405de926cb4f8799ce81fe9a5cc3abfcbd8629e` (PR #8 squash merge).
- Reviewed PR head: `924fce1d015caebb7950cb6e6d9982899b29a4f0`; merge tree equality was verified.
- Exact-head clean Linux / Node 22 CI: https://github.com/KiritoKing/term-style-blog/actions/runs/34323042836 (pass).
- Tag `v1.0.0` is annotated and resolves to the release source. Subsequent closeout changes only add terminal security regression tests, record acceptance and archive specs; application code is identical.

## Delivered changes

MIT license and preserved Astro starter / Neofetch notices; explicit coverage of project-original historical design prototypes; separate article/media licensing. Added Chinese and English README, an actual public-site screenshot, configuration/content guides, contribution/security/conduct documents, issue/PR templates, changelog and Dependabot configuration. Corrected GitHub description/homepage/topics and package metadata. Removed the obsolete machine-local Notion loader override and outdated credential examples.

Public PR CI grants read-only permissions, does not persist checkout credentials, and pins actions to full commit SHAs. Personal publication prepare is limited to this owner repository's main ref, before any dependent secret-bearing job. A failing workflow-boundary regression preceded this fix, then passed.

A security audit found vulnerable original dependencies. An isolated remediation upgraded Astro to 7.3.2, compatible React/unified/Sharp/toolchain packages and two fixture ZodError accessors. Root retained `compressHTML: true` and the existing remark plugin order. Minimum runtime is Node 22.12.0. No advisory suppression or dependency override masks the final audit.

## Validation

- `pnpm install --frozen-lockfile`: pass.
- `pnpm test`: 112 tests pass; `pnpm test:deployment`: 24 pass.
- `PUBLIC_DEPLOYMENT_ENV=preview pnpm check`: zero errors/warnings; 31 schema deprecation hints remain.
- Bundled Markdown build and clean CI Chromium: 15 pass, 11 explicitly real-corpus-only skips.
- Strict external build with immutable approved snapshot `d9dbbe357e528ae654f5474046675fb45c0dfdbc`, 53 posts: pass; Pagefind indexes 53 articles.
- `E2E_POST_SLUG=KeePass E2E_SEARCH_QUERY=前端 E2E_REAL_CORPUS=1 E2E_REAL_LISTINGS=1 pnpm test:e2e`: 26 pass.
- Full local geometry traversal: 103 rendered routes × desktop/mobile = 206 passes, zero failures, 2872 scroll positions. This acceptance used DOM geometry/media checks and local screenshots, not fresh model-based visual assertions. Root also viewed representative desktop/mobile homepage, KeePass, AI-tools and ROG article screenshots.
- HTTP aliases: 162 checked, 158 available destinations plus 4 expected 404 aliases of the previously deprecated `mobile-web-dev` article. Its withdrawal is preserved.
- The closeout suite passes 29/29 real-corpus browser tests. Three additional terminal security regressions pass on the unchanged release build: markup echo and restored history stay text; script/external navigation inputs are rejected; search queries are encoded under the same-origin search route.
- Root final `pnpm audit --json`: zero reported vulnerabilities across 735 dependencies; isolated remediation also passed separate production/development audits.
- YAML and embedded Bash parse for 9 changed configuration files; 30 local documentation links resolve; ignore rules protect environment/key/runtime files; `git diff --check` passes.
- Strict OpenSpec validation passes; stale tdd-governance and test-harness documentation was aligned with existing behavior. New open-source-distribution spec is synced and this change archived.

## Exposure and provenance review

Independent reviewers audited all 11 remote branches, 7 PR refs, 52 commits, 16 retained Actions logs, 12 unexpired artifacts (including 15 trace archives), historical ZIPs and report images. Official checksum-verified Gitleaks 8.30.1 all-ref/archive/delta scans found zero secrets; targeted review found no credential, private key, private vault note or unapproved article. Root repeated a redacted scan on the final release delta with zero findings. Existing artifacts contain approved public-site or synthetic data and are retained; no blanket deletion or history rewrite was necessary. A private pre-release Git bundle and settings snapshot remain available for operational recovery.

Original project source, demo content and historical design prototypes receive MIT under the owner's authorization. Preserve upstream attribution; the source grant does not relicense actual articles or external assets.

## GitHub settings and readback

Applied and read back: public visibility; MIT detection; read-only Actions token; external fork contributor approval; full-SHA action pinning; main branch protection requiring `verify`, preventing force push/deletion and resolving review conversations, without a mandatory human approval count. Enabled private vulnerability reporting, Dependabot alerts/security updates, secret scanning/push protection and CodeQL default setup.

Anonymous GitHub API reads returned the public repository and non-draft v1.0.0 release; credential-helper-free Git advertised main and the annotated release tag. The separate vault repository remains private. Public live homepage returns the terminal site. Production variables remain `PUBLICATION_PRODUCTION_ENABLED=false` and `PUBLICATION_PREVIEW_REVIEW=manual`; no Cloudflare deployment, DNS, Sync, R2 credential or vault mutation occurred in this task.

## CodeQL alert triage

The first CodeQL setup run 34324043967 completed successfully and raised one `js/xss-through-dom` alert at TerminalPanel.tsx:160. Root and an independent reviewer traced the exact release source: `resolveNavigationPath` always returns a literal slash-prefixed path, and dynamic slugs follow `/posts/`, `/categories/` or `/tags/`. Input cannot form a script scheme or external host; the search helper receives only `/search?q=` plus encoded query text. React renders output as text. Browser payload probes confirm these boundaries. Alert #1 was dismissed as a documented false positive, with its full source-flow reasoning retained here; no rule suppression, runtime workaround or hidden security failure was introduced. Secret-scanning and Dependabot readback show zero open alerts. The release main CI run 34323990532 also passed.

## Evidence and follow-ups

Private operational evidence is outside the repository under `/tmp/term-blog-open-source-audit-20260909`: redacted scan reports, dependency audits, local logs, full geometry/redirect results, anonymous API readbacks and pre-change backups. Real article content and credentials are not committed here.

No release blocker or required user action remains. Future contributions and dependency updates use the protected PR workflow; maintenance of deprecated schema APIs is separate from this source release.
