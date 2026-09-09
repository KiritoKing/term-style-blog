# AUTO01 automatic production publication

Status: done
Date: 2026-09-09

## Result and ownership

Owner-authorized save-to-production is enabled: `PUBLICATION_PRODUCTION_ENABLED=true`, `PUBLICATION_PREVIEW_REVIEW=automatic`. Obsidian Sync remains the only vault synchronization mechanism. Hermes reads the approved publication directory and writes only its isolated Git snapshot/state. CI never writes article content or status back into the live vault. The legacy Notion Git production writer remains disabled, verified by the production baseline guard.

Implementation PR #11, runtime repair PR #12 and deterministic fixture repair PR #13 are merged. Accepted production framework: `6c4627697b7e0e7c44376621104b7dc05529c186`. This closeout changes documentation/specification state only; main-source changes alone do not deploy.

## Live evidence

| Stage | Evidence | Result |
| --- | --- | --- |
| Protected preview before enabling production |[34350240034](https://github.com/KiritoKing/term-style-blog/actions/runs/34350240034) |103 normal hosted routes verified; anonymous request302, machine Service Auth accepted |
| Real save12:38:28UTC |[34352329632](https://github.com/KiritoKing/term-style-blog/actions/runs/34352329632), repository_dispatch12:39:50UTC |production accepted12:43:00UTC; about 4m32s |
| Byte-exact restoration12:44:48UTC |[34352935115](https://github.com/KiritoKing/term-style-blog/actions/runs/34352935115), repository_dispatch12:45:54UTC |production accepted12:48:37UTC; about 3m49s |

Successful save content: `cc2f329c1d5dcc5adb2e36ca93404a8cc421a3a4`; production deployment: `8561f621-7053-49ae-9809-cc25672e68be`.

Final restored content: `d1bd7e2ec3b16246a30bcfd756a541d5ea129f7d`; deployment: `8d60c430-fa10-4251-b089-aa36969a7398`; manifest: `8873be5a1f0a233c91ec562bcaed706e047560584449318600dcbd99549b1c2a`; source tree: `0bfba329bae5273e47017971616a5ba4015e3785d310300480807f0c607b25b1`; production artifact: `365c299db78530e5407ed4edf6c42d02c20dcfaa54b840df4cfc59169c4b7804`; public revision: `5ca6ba35299173076c0d4ceb65ccea9187708f500a3af12ab558ff6cbcf6b947`.

All 54 article files in the final snapshot are byte-identical to the pre-test060779b snapshot. The only canary was a temporary frontmatter comment in an already-published article; it is removed. Local restored SHA-256: `b8fd370a33555afb35cd1bd152382957297741d09ccf6d26556f4810abe57f87`. No article semantics or publishing fields changed. Local Sync finishes in synced state. Both bare and www domains serve the final identity.

## Verification

- `pnpm test:deployment`:43/43; concurrency-focused fixtures 50/50 repeated runs.
- `pnpm test`:112 tests; `pnpm check`:zero errors/warnings, existing hints only.
- Strict real54-article build and 29 real Chromium checks ran in each successful publication job.
- Hosted verifier checked all 103 normal HTML routes for expected immutable revision, title and indexing policy on both protected previews and public production.
- Additional live Chromium acceptance:4 representative routes across 1440x1000 and 390x844,8 visits per successful deployment; correct publication identity, visible article/shell, no page overflow, no broken loaded images or page errors, and working terminal help. Desktop and mobile screenshots were inspected. This is sampled live visual acceptance, not a new all-page Midscene audit.
- Final configuration heads passed source CI and aggregate CodeQL:34335563463(PR #11),34351458925(PR #12),34352007524(PR #13).
- Independent implementation reviewer passed with then-pending live integration limits; root completed the live checks above.
- Strict OpenSpec and whitespace checks pass. The delta is synchronized and archived in this closeout.

## Failure evidence retained and repaired

- Run 34350956620 failed before upload because the isolated production runner lacked pnpm. Production recovery checked that the recorded previous deployment was still current. PR #12 installs pinned pnpm and supported Node in that job; its regression failed before the fix and passes afterward.
- Run 34351742631 stopped before deployment on a flaky1ms/8ms concurrency fixture. PR #13 replaces wall-clock scheduling assumptions with a two-arrival barrier and an event-loop drain boundary, retaining exact concurrency and completion assertions. No test or acceptance gate was skipped.
- Initial CodeQL findings in PR #11 were repaired with one-pass entity decoding and tolerant script/style-end-tag handling. No alerts were dismissed.

## Access, recovery and limits

The existing Pages preview Access application retains its human Allow policy and now includes a Service Auth policy restricted to the dedicated term-style-blog-ci-preview token. GitHub stores the pair as CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET. The token expires2027-09-09. Zero Trust free-plan activation and its checkout billing authorization were explicitly approved by the owner. Access headers are restricted to the exact accepted preview origin; public production receives none.

Every production attempt captures its previous deployment before upload. On failed final acceptance it may restore that baseline only while the failed candidate is still current. Offline tests cover rollback ownership; live failure verified the no-upload/no-op recovery case. A deliberate destructive production failure was not injected. The last successful restoration run preserved 8561f621 as its recovery baseline.

This acceptance exercised the current Mac through real Sync and Hermes. Other physical Macs/mobile clients must finish their existing Sync normally; they were not individually tested. Sync/API/build outages delay publication. Normal directory additions, changes and withdrawals use the same existing exporter; draft/metadata/privacy gates and mass-delete guards remain. The bridge retries failed dispatch transport, not accepted CI failures. Pause new production with PUBLICATION_PRODUCTION_ENABLED=false.

Private raw logs, byte backup, guarded probe, screenshots and downloaded run records are in `/tmp/term-blog-open-source-audit-20260909/auto-production`. GitHub retains non-secret production/recovery artifacts under the linked runs according to workflow retention. No credentials are included in this report.

## Plan review

No additional plan adjustment proposed. AUTO01 is accepted and complete; no implementation or live activation blocker remains.
