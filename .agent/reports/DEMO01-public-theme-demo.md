# Report: DEMO01 public-theme-demo

Status: partial
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
