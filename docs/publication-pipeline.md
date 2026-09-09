# Publication triggers and ownership

Verified operational snapshot: 2026-09-09. Obsidian Markdown remains the content source of truth. The live production site is already deployed; the current automatic path ends at a Cloudflare preview because production policy is false/manual.

## Trigger map

| Trigger | Actor | Result |
| --- | --- | --- |
| Save a note on either Mac or a mobile device | Obsidian Sync client and Sync service | Synchronize the vault to the other clients, including Hermes Headless |
| Sync changes arrive on Hermes | `obsidian-headless.service`, running as `hermes` | Update the live headless vault continuously |
| Every two minutes after boot | `blog-publish-export.timer` starts the oneshot exporter as `hermes` | Check the approved publication directory, Sync completion and content hashes |
| Stable approved publication bytes differ | The Hermes publication exporter | Write and push a sanitized immutable commit to private `llm-obsidian:publish-snapshots` |
| A publication snapshot is ready to announce | The exporter through authenticated `gh` | Send `repository_dispatch` with type `content_published_changed` to `term-style-blog` |
| Valid immutable content event or manual workflow dispatch | GitHub `Blog publish (Cloudflare)` | Validate, build, test and upload a noindex preview |
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

Current repository variables are `PUBLICATION_PRODUCTION_ENABLED=false` and `PUBLICATION_PREVIEW_REVIEW=manual`. A successful automatic event therefore deploys a preview and records human acceptance as pending. It does not move the `chlorinec.top` production deployment. This is a policy stop, not a pending GitHub environment approval: the production environment has no reviewer protection rules, and manual `production-retry` is rejected while production is disabled or preview review remains manual. The Access-protected preview must not be accepted by mistaking its login page for rendered blog HTML.

Each dispatch binds the framework to the immutable main tip at that event. Before any enabled production upload, the workflow checks that framework main and the publication branch still match the candidate. A framework source change on main takes effect in a later publication build; source CI alone does not deploy the live blog. Production remains subject to a separately authorized policy change and the existing deployment gates. See [configuration and deployment](getting-started.md) for the immutable input contract and fork setup.

The older Vercel demo’s Git auto-deployment is disabled in this repository. Existing GitHub logs and deployment records are retained as audit history; CodeQL and Dependabot job activity is not another blog publication pipeline.
