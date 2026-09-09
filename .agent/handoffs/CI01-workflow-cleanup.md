# CI01 handoff

Status: done
Branch: codex/ci-cleanup-20260909
Owner: none
Integration: PR #10

Completed: legacy Vercel Git deployment disabled; CI/publication roles named; weekly dependency grouping configured; authoritative publication-trigger explanation documented. All existing gates retained. Accepted configuration CI and CodeQL passed; PR checks no longer contain Vercel. See the CI01 report for exact source/run evidence and live Hermes readback. Specs synced/archived and locks released.

Next: no additional cleanup action. Normal automatic content publication ends at manual-review Cloudflare preview under false/manual variables; production-retry cannot bypass them. Do not infer a new production-policy authorization from this cleanup.
