# Report: DEMO01 static-only binding review correction

Status: pass (local verification; exact-commit hosted acceptance tracked in PR25 and external delivery evidence)
Branch: feat/public-theme-demo
Baseline: 2cb7dd1b722604470cdd7a341c7ddc1598f0ff22
Review: https://github.com/KiritoKing/term-style-blog/pull/25#discussion_r4228652577

Result: the partial-name regex omitted four documented binding maps: browsers, mtls_certificates, queue_producers and vectorize_bindings. The official Pages project schema lists these alongside nine previously covered maps. The guard now uses the explicit 13-field set and checks both preview and production configs before any write. This is a contract-validation gap; no evidence of installed unsafe bindings or a data leak was found. All regressions use synthetic API replies.

Reference: https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/

Files changed: scripts/public-demo/control.mjs; tests/deployment/public-demo.test.mjs; bounded DEMO01 state/report/handoff.
Tests added: 13 independently named binding-map refusal cases, each covering both environments and exactly one read-only GET; one safe-reuse case covering empty/null/absent maps and unrelated deployment metadata.

Commands/results:
- Test-first public-demo regressions: RED exactly four missing expected rejections; GREEN 26 passed.
- pnpm install --frozen-lockfile: pass with pinned pnpm10.28.0; existing esbuild lifecycle restriction retained.
- pnpm test: 122 passed.
- pnpm test:deployment: 82 passed.
- pnpm check: 0 errors, 0 warnings, 31 existing hints.
- Neutral template preview build and full Chromium suite: 33 passed, 12 private-corpus skips.
- Owner synthetic preview build and full Chromium suite: 32 passed, 13 skips.
- All 33 strict OpenSpec validations: pass.
- Node syntax checks for both changed modules and git diff --check: pass.

OpenSpec impact: implements the existing archived public-theme-demo static-only contract. No new behavior or delta to sync/archive.
Risks: documented schema changes need future list maintenance. Real-browser coverage remains Chromium only. No new browser JS, dependency, Functions, workflow, credentials, permissions, production content, Access rule, paid plan or merge action.
Follow-ups: push the minimal fix to the existing branch; verify CI and the existing isolated public demo at the exact new SHA. Preserve the user-selected ready status. Existing uncommitted DEP01 report/handoff and supervisor closure bookkeeping are excluded from this commit.
