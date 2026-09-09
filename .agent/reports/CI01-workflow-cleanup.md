# CI01 workflow cleanup

Status: in_progress

Plan: remove the legacy Vercel demo’s Git deployment entry, clarify CI/publication role names, group weekly dependency maintenance, retain all validation and security gates, and document the read-only verified Sync/export/dispatch chain. Existing run evidence, live Cloudflare deployment and private vault remain unchanged. Exact scope and tests are recorded in the active OpenSpec change.

Local configuration parsing, embedded Bash syntax,24 existing publication boundary tests and strict change validation pass. Live reviewer verified the two-minute systemd export timer, continuous Headless service,250ms stability scan, zero-pending/server-hash/service-health attestation, isolated Git write boundary, no-change suppression, bound dispatch retry, mass-delete guard and false/manual production policy. The trigger explanation is in docs/publication-pipeline.md. GitHub exact-head CI and the Vercel opt-out readback remain pending.
