# Report: DEMO01 public-theme-demo

Status: pass
Branch: feat/public-theme-demo (stacked on PR24 afb1a845)
Authorization: owner approved one dedicated public Pages project and reviews, no merge/production/Access/new credential/paid plan.

Files changed: bounded public-demo control/prepare/anonymous verifier, owned push workflow, deployment regressions and OpenSpec/state files.
Tests added: 8 Node cases for origin, pagination/quota, one creation, safe reuse, unsafe project/runtime rejection, sanitized API errors, free static limits and workflow boundary.

Commands/results:
- RED node --test tests/deployment/public-demo.test.mjs: missing module before implementation.
- GREEN same command: 8 passed.
- pnpm install --frozen-lockfile: pass, pnpm10.28; existing esbuild lifecycle restriction retained.
- pnpm test: 122 pass.
- pnpm test:deployment: 64 pass.
- pnpm check: 0 errors/0 warnings/31 existing hints.
- template build + Chromium: 33 pass/12 private-corpus skips.
- chlorine synthetic build + Chromium: 32 pass/13 skips.
- actionlint1.7.7, syntax, strict OpenSpec and diff check: pass; shellcheck unavailable.
- Initial template browser invocation omitted the build's SITE_URL and caused 3 expected-origin assertion failures; rerun with matching SITE_URL passed all 33. No application change.

OpenSpec impact: public-theme-demo active, remote acceptance pending.
Risks: existing token creation permission, account quota, domain-wide Access policy and anonymous origin propagation remain to be verified by controlled Actions. Existing protected verifier and production workflow have no diff from PR24. Only Chromium is covered.
Follow-ups: push draft stacked PR, inspect sanitized quota/create evidence, anonymously verify hash/stable URLs, preserve screenshots and source SHA; finish docs/spec archive. Dependency review is independent and does not authorize merge.

Remote first attempt: PR25 / SHA f54abfbb1d5b27e2ceedacbddc33272624007db2; CI46 run37905152657 succeeded. Demo run37905057364 build113736415311 succeeded, deploy113736857775 stopped during GET project pagination with HTTP400/code8000024 before any creation/upload. Changed per_page100 to official API example20 after a failing regression, then 8 tests pass. This is an input adjustment, not a permission change; quota/create/anonymous proof remain pending.

Second attempt58f7d337 run37905406226 also rejects per_page20 before mutation. Official Cloudflare workers-sdk/src/pages/projects.ts listProjects uses per_page10 and exhausts pages without depending on result_info. Follow that primary implementation, add RED/GREEN missing-metadata pagination and duplicate-page rejection; 9 tests pass. No raw API response/config or credential is printed.

Third attempte34068109ae7f2bf70cf7b323b00acfacc342d68 run37905974284 build113739395279 passes; deploy113739864593 confirms7existingprojects (<100),161staticfiles/largest662087B/noFunctions/no paid-plan request and creates the authorized project. WranglerAction4.1.3 successfully uploads previewhttps://6ef4e6a7.term-style-blog-demo.pages.dev withstablepublic-demoalias. Anonymous verification fails at fresh-domain TLS handshake (ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE), not authentication. Add test-first bounded secure propagation retry (max180seconds; noTLSbypass/Accessfallback/redirectfollowing), permanent certificate failure regression and navigation wait. Hosted acceptance still pending.


Final implementation acceptance: bd42568c161243c3bad2668b7e9475b11392e6cf integrates approved PR20/PR16 with no app changes. Local frozen install,122unit/67deployment/check0errors0warnings31hints,template33/owner32Chromium and both synthetic builds pass. CI52run37907260776 passes both profiles. Public demo5run37907255584 build113743595636/deploy113744010999 succeeds; anonymous stable https://public-demo.term-style-blog-demo.pages.dev and immutable https://4662320b.term-style-blog-demo.pages.dev validate all25HTMLroutes and four theme/width combinations, image HTTP200, zoom1.34986/reset1, drag/touch pan/mobile pinch, Escape/focus,3repeats and Astro/link behavior.8projects total (7before authorized creation),164staticfiles/largest662087B; noFunctions/paidplan. Hosted artifact11605325948 SHA25610b8ef5f686de191521f0e9a38e822d94889aec9205f785d4fa72573ac5b1832 preserves actual hosted PNGs/records.

Cloud filesystem download of hosted attachment is blocked by network proxy403; no bypass attempted. Four separately captured local neutral screenshots at the same code SHA were visually inspected,385087bytes. Prepared Library flow fails at tools/list before mutation; existing user-authorized direct fallback succeeds for all four, including metadata persistence: homepage libfile_8f6f53b506f48191b66713faec67fc18; article libfile_61d83f2f5cc8819192cf478e639f2a7d; mobile libfile_57bde74ad5248191ab21359634d0266f; viewer libfile_8699dd3acf5c8191badcf68bf957d494. These Library copies are local captures, not downloaded hosted originals.

OpenSpec two requirements synced and archived2026-10-09-public-theme-demo; DEMO01done/locksreleased. Final documentation-only head receives fresh CI/deployment evidence in PR25 metadata and external delivery JSON without recursive evidence commits. No new client JS/direct dependency; deployment code runs only in Node/Actions. Audit2moderate1low; http-cache upstream fix remains unconfirmed per dependency-review.md. No main write/merge/production/private snapshot/Notion/Access/OAuth/new credential/paid service. Chromium only; Portal submission/admin remains owner action.


Neutral raster correction (owner-authorized QA follow-up): the landscape pixel title now says guest@blog: ~/image-viewer. PNG remains1600×900; direct raw-pixel comparison changes6780title pixels and zero pixels outside x110..759/y110..164. Original source image remains elsewhere unchanged for comparison only; not committed. Portrait inspected neutral. Final PNG SHA256c9cd14772519bf4e72a57d4b38e7f51f74c42054a7f519f3518a72e56b41b182,78073bytes. Catalogue viewer screenshot updated76168bytes; four screenshots384752bytes. No application UI/client/dependency change.

Test-first stale-raster acceptance: RED missingverifyAssetBytes then GREEN12public-demo/68deployment. Separate immutable/stable anonymous PNG comparisons now record asset_sha256; stale image bytes cannot pass SHA-bound acceptance.122unit/check0errors0warnings31hints,previewbuild,15relatedChromium and33strictspec pass. One invocation used systempnpm and aborted a module purge without mutation; rerun via pinnedcorepack succeeds. Earlier capture server orphan caused port conflict; verified owned processes stopped, subsequent15browser tests pass. Fresh audit remains2moderate1low plus unconfirmed http-cache note. Existing contracts apply; no new behavior/spec delta or unrelated UI rewrite.

The original viewer Library identity libfile_8699dd3acf5c8191badcf68bf957d494 was replaced with a version guard0→1 and metadata persisted; it now contains the neutral local screenshot. Other three screenshots retain their prior IDs. Final correction commit gets fresh fullCI/publicall-route/image-digest/browser acceptance in PR25 metadata/externaldelivery before return. No production/merge/Access/private/credential operation.
