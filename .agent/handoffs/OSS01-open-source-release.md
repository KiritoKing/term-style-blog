# Handoff: OSS01 open-source release

Status: in_progress
Owner: codex-root
Branch: codex/open-source-release-20260909
Last updated: 2026-09-09

Objective: Public, licensed and verified source release; user authorizes completion without additional review.
Relevant specs: openspec/changes/open-source-release; publication-deployment.
Allowed paths and locks: tasks.yaml OSS01; root-only package/workflows. Dependency spike runs in an independent private copy, not the root source tree.

Completed: public entry docs/configs and MIT/upstream notices prepared; baseline112unit/24deployment/Astro/build/15fixturebrowser pass; metadata and read-only Actions default updated while repository remains private.
Completed additionally: all-ref/log/artifact sensitive-content review passed; bounded Astro7 dependency remediation integrated with zero reported audit vulnerabilities.
In progress: final exact-source browser/layout acceptance and publication.
Next: integrate bounded dependency remediation, rerun exact source gates, create/merge PR with passing CI, public visibility/security configuration and v1.0.0, verify anonymous access and update this record.

Risks: no remaining security or provenance blocker in the completed audit; final public readback still pending. Do not expose private source or use a public scan artifact containing secret values. Live blog and private vault are unchanged; future content remains manual preview.
