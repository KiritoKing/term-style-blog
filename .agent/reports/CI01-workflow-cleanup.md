# CI01 workflow cleanup

Status: pass / done
Integration: https://github.com/KiritoKing/term-style-blog/pull/10

## Changes

Disabled the legacy Vercel demo’s automatic Git deployments with the supported `git.deploymentEnabled=false` repository opt-out. Named the actual workflows `CI` and `Blog publish (Cloudflare)`, with content-event/manual run titles. Kept the existing `verify` branch-protection context and CI concurrency behavior.

Grouped npm minor/patch and Actions updates for Monday 09:00 Asia/Shanghai, with routine PR limits of 2 and 1. Separate security-update groups remain enabled independently of routine scheduling. GitHub-managed CodeQL, all existing test/build/security gates, immutable publication validation and false/manual production policy remain intact. Historical run evidence was retained.

Documented the authoritative current Sync/export/GitHub/Cloudflare trigger and ownership map in docs/publication-pipeline.md and linked it from both READMEs and the setup guide. No application code, live deployment, credential or vault mutation occurred.

## Verification

- 24 existing publication/workflow-boundary tests pass.
- YAML/JSON, embedded Bash syntax, documentation links and strict OpenSpec validation pass; diff checks pass.
- Accepted configuration head: `a7cea8666862bc23b72f3510467dcf1494c29e4e`; exact-head CI run 34326017395 passed. CodeQL Actions, JavaScript/TypeScript and Python analyses passed.
- The exact PR check rollup contains only verify, the CodeQL language checks and its aggregate. Neither Vercel deployment nor Vercel Preview Comments appears; the legacy opt-out took effect on the new branch commit.
- Final closeout changes only record evidence, clarify the production-policy stop and archive specs. PR #10 holds the protected merge check record for that final head.

## Live pipeline readback

A separate read-only reviewer used the required PVE probe and inspected current CT107 units, timers, attestation, deployed-tool checksums, isolated Git state, GitHub workflow/variables/environment and Actions history. Observation: 2026-09-09 07:45–07:51 UTC. Headless continuous Sync and the two-minute exporter timer were active; the last successful attestation at 07:49:36.897Z had zero pending files, matching server hashes and a healthy service.

The exporter reads only approved published Markdown, uses 250 ms double-scan stability plus Sync checks, and writes only its isolated snapshot checkout/state. No change means no commit/push/dispatch. Invalid status/conflicts and guarded mass deletions stop the cycle. Pending notification transport can retry without another push; an already accepted CI/deploy failure is not automatically retried by Hermes. No additional periodic Headless restart timer exists.

Last automatic preview run 34280652058 succeeded. The separate initial production cutover run 34318692710 succeeded later, without enabling normal automatic production. Current false/manual variables stop production; the GitHub production environment has no reviewer approval rules, so this is not an approval button waiting to be clicked. Manual production-retry is also rejected until policy permits it. Framework pushes alone trigger source CI, not content publication.

Private read-only audit evidence: /tmp/term-blog-open-source-audit-20260909/pipeline/pipeline-live-facts.md. Public documentation intentionally omits credentials and unnecessary host/network details.

## OpenSpec and follow-ups

ci-workflow-roles synced and ci-workflow-cleanup archived; locks released. No further cleanup blocker or required user action remains. Enabling fully automatic production is a separate policy decision and requires its existing acceptance gates; this cleanup does not change that decision.
