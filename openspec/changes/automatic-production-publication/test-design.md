# Test design

- Unit (Node built-in fixtures): complete route inventory and identity; stale/wrong identity; Access login 200; redirect credentials never forwarded; incomplete auth rejected; policy mismatch; missing routes/revision rejected.
- Workflow regression: automatic-only stamp/verification, both modes, no secret artifacts, existing source freshness and serialization.
- Existing deployment, unit, Astro check and strict build gates remain.
- Hosted preview: real Access machine auth, all generated HTML routes, robots and immutable identity before production enabled.
- E2E: preserve one eligible source file, save an exportable metadata change locally, observe Sync receiver + bridge + repository_dispatch + verified production revision, restore metadata and prove final site revision. Existing Chromium desktop/mobile interactions run in publication CI and one production browser smoke.

## Live integration regression: isolated production runner

Run 34350956620 failed before upload because Wrangler detects the repository pnpm lockfile but the isolated production job had no pnpm executable. Add a workflow contract regression proving that both upload jobs install their own pinned pnpm and supported Node before Wrangler. RED reproduces the missing production runtime. Then rerun the actual save-driven deployment; local static tests alone cannot close this incident.
