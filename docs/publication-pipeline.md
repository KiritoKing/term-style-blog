# Publication triggers and ownership

Obsidian Markdown remains the content source of truth. This document describes the owner-authorized save-to-production path. Unconfigured installations still default to a manual preview; production requires the explicit policy below. Operational activation and E2E evidence are recorded in the AUTO01 report.

## Verified owner deployment (2026-09-09)

The owner's installation is active with `PUBLICATION_PRODUCTION_ENABLED=true` and `PUBLICATION_PREVIEW_REVIEW=automatic`. A real local save and its byte-exact restoration each independently traveled through Obsidian Sync, the normal Hermes timer, repository_dispatch, protected preview acceptance and production. Neither successful run was manually dispatched.

| Source change (UTC) | Automatic event | Public production accepted | Evidence |
| --- | --- | --- | --- |
| Save temporary YAML comment,12:38:28 |12:39:50 |12:43:00 |[save run 34352329632](https://github.com/KiritoKing/term-style-blog/actions/runs/34352329632) |
| Restore original bytes,12:44:48 |12:45:54 |12:48:37 |[restoration run 34352935115](https://github.com/KiritoKing/term-style-blog/actions/runs/34352935115) |

Both runs verified all 103 normal hosted HTML routes and passed desktop/mobile browser checks. The final 54-article source tree matches the pre-test content exactly. Successful observed save-to-site durations were about 4m32s and3m49s; these are measurements, not an SLA. The first diagnostic attempt encountered a temporary local Sync error before recovering; the Mac/mobile client must be online and finish Sync before Hermes can publish its changes. Other physical clients were not individually exercised in this acceptance.

The dedicated Access service token expires on 2027-09-09. Renew it and replace both GitHub Access secrets before expiry. An expired token blocks preview acceptance and therefore new production updates. To pause publication, set `PUBLICATION_PRODUCTION_ENABLED=false`; normal vault synchronization continues. If a save does not appear, first check Obsidian Sync, then the latest Blog publish run. For exact identities, validation and retained failure evidence see the [AUTO01 report](../.agent/reports/AUTO01-automatic-production.md).

## Trigger map

| Trigger | Actor | Result |
| --- | --- | --- |
| Save a note on either Mac or a mobile device | Obsidian Sync client and Sync service | Synchronize the vault to the other clients, including Hermes Headless |
| Sync changes arrive on Hermes | `obsidian-headless.service`, running as `hermes` | Update the live headless vault continuously |
| Every two minutes after boot | `blog-publish-export.timer` starts the oneshot exporter as `hermes` | Check the approved publication directory, Sync completion and content hashes |
| Stable approved publication bytes differ | The Hermes publication exporter | Write and push a sanitized immutable commit to private `llm-obsidian:publish-snapshots` |
| A publication snapshot is ready to announce | The exporter through authenticated `gh` | Send `repository_dispatch` with type `content_published_changed` to `term-style-blog` |
| Valid immutable content event or manual workflow dispatch | GitHub `Blog publish (Cloudflare)` | Validate, build, test and upload a noindex preview |
| Protected preview passes every hosted route and immutable identity check | GitHub publication workflow | Rebuild production from the same sources, serialize promotion, then verify `chlorinec.top` |
| Framework PR or main push | GitHub `CI`, plus CodeQL | Validate framework source; no content publication is triggered by this alone |
| Monday 09:00 Asia/Shanghai | Dependabot | Group routine dependency updates into reviewable PRs; security updates remain separately enabled |

The timer uses a two-minute boot delay and two-minute activation interval with one-second timer accuracy. The exporter performs two content scans separated by 250 ms, alongside checks that Sync has no pending files, its server hashes agree and the service is healthy. These are publication-read guards; the exporter does not become another writer of the live vault.

## The two Git boundaries

The live vault continues to synchronize through Obsidian Sync. The publication bridge reads only `20-writing/published`; its filesystem write permissions are limited to its isolated snapshot checkout and bridge state. It cannot read the Headless authentication/configuration directory. Git does not pull into the live vault.

The private snapshot commit contains approved Markdown and the publication manifest. GitHub receives the exact content SHA, manifest digest and source-tree digest. It validates these before building; article content does not live in the public framework repository.

## Changes, guards and retries

The service is a timer, not an editor-save webhook or filesystem watcher. Editing drafts or other vault directories still allows the scheduled check to run, but does not change the publication snapshot or create a GitHub run. With no export change, it skips commit, push and dispatch.

Inside `20-writing/published`, articles must pass the existing metadata gates with `status: publish` or `published` and blog as their target. Leaving `status: draft` in this directory fails the whole export and preserves the previous snapshot; it is not a withdrawal action. To withdraw a normal article, remove it from the approved publication directory. The next accepted snapshot records that deletion.

An empty snapshot, or a deletion of at least 10 articles AND at least 25% of the previous set, requires an explicit mass-delete flag bound to the exact previous manifest hash. The automated timer does not carry that flag. It stops instead of turning a partial Sync or accidental mass deletion into a public withdrawal.

If snapshot push succeeded but GitHub dispatch delivery failed, bridge state records that exact pending SHA and a later timer retries dispatch without pushing again. An accepted event whose GitHub CI or Cloudflare deployment later fails is not automatically retried by Hermes: retry the immutable preview through workflow_dispatch after resolving the failure. Production retry remains subject to the production policy gates below.

Headless Sync is a continuous enabled service with restart-on-failure after 15 seconds. There is no additional periodic Headless reconcile/restart timer. The publication exporter is deterministic software started by systemd; it is not an AI agent deciding when or what to publish. It never writes publication status back into the active vault.

## Preview and production

Automatic production uses `PUBLICATION_PRODUCTION_ENABLED=true` and `PUBLICATION_PREVIEW_REVIEW=automatic`. For a pause, set production to `false`; use `manual` review to retain human-only preview acceptance. Unset values default to `false/manual`. The production environment has no reviewer protection rules. Manual `production-retry` is rejected unless both automatic policy gates are enabled.

CI accesses the existing `*.notion-astro-rev.pages.dev` Access application with a dedicated Service Auth token, stored in `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`. Human login protection remains. The headers are sent only to the exact validated Pages deployment origin, never to the public domain or another redirected host. Access login HTML, missing credentials, redirects and wrong revisions fail acceptance. Token setup follows [Cloudflare service authentication](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/); renew its configured expiry before it lapses.

After strict metadata/asset checks and local browser acceptance, every HTML page is stamped with an immutable publication revision. `publication.json` records source identities and the generated route inventory. The hosted verifier checks this exact record, every generated page's revision/title/indexing policy and robots rules. Preview must be noindex; a separately rebuilt production artifact must allow indexing. The immutable source SHA changes even if a source edit does not visibly alter rendered text.

Each dispatch binds framework main and content to immutable commits. Before production, both branch tips must still match. Uploads are serialized per project; the legacy Notion Git production writer must remain disabled. The workflow captures the current deployment ID before upload and verifies the new source identity at `https://chlorinec.top`. If final acceptance fails, it attempts rollback only while its own run still owns the current production deployment. Another writer is never silently rolled back. A failed run remains failed even after recovery.

A source-main push alone does not deploy. The next content event uses the updated framework; an operator can also submit a validated immutable `production-retry`. The expected save-to-site delay is Sync propagation plus up to about two minutes for the bridge, followed by CI/build/preview/production acceptance. Multiple quick saves can make older candidates stale; only an accepted current candidate can promote. CI or Access failure preserves the prior site unless promotion already happened, in which case the conditional recovery path applies. See [configuration and deployment](getting-started.md).

The older Vercel demo’s Git auto-deployment is disabled in this repository. Existing GitHub logs and deployment records are retained as audit history; CodeQL and Dependabot job activity is not another blog publication pipeline.
