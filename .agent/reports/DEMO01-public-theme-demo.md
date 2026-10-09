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
