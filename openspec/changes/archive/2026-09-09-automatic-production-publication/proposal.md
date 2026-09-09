# Automatic production publication

## Why
The owner now explicitly authorizes saved approved content to update the formal site. The existing path stops at manual Access-protected preview, so production cannot run safely without authenticated hosted verification.

## What Changes
- Keep Sync as the live vault writer and the existing two-minute isolated snapshot bridge.
- Add immutable publication identity and full generated HTML route acceptance, with scoped Cloudflare Access service authentication.
- Verify the actual production domain after promotion; retain a known previous deployment for recovery.
- Enable repository policy only after a successful hosted preview run, then exercise a reversible metadata save through Sync.

## Impact
Allowed implementation: deploy workflow, package deployment test command if needed, scripts/verify-hosted-publication.mjs, tests/deployment, publication documentation, this spec and .agent records. Cloudflare: one service token and one policy scoped to existing Pages Access application; GitHub: two secret values and publication policy variables. No render redesign or article body changes. Local canary changes only one eligible article's exportable non-body metadata with a byte backup and restoration; no draft publication. Root owns shared files; bounded verifier worker owns only its script/test.
