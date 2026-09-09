# OSS01 open-source release

Status: in_progress

## Plan and scope

The repository owner explicitly authorizes configuration, metadata, documentation, licensing and public visibility without a further review step. Root works from a206bc1 on codex/open-source-release-20260909; user checkouts and the live production deployment remain unchanged. Original source, fixtures, documentation and historical project-original design prototypes receive MIT; Astro starter and Neofetch notices are preserved; external article licensing remains separate.

Files: README (Chinese/English), LICENSE/NOTICE, contribution/conduct/security guides, content/deployment guides, screenshot, environment/ignore/package/lock configuration, issue/PR/Dependabot configuration, fixture/publication CI boundaries, OpenSpec and agent records. Source screenshot is an actual public homepage capture. No private article corpus or credentials are added.

## Verification so far

- Independent provenance review identified retained Astro starter assets and a machine-local Notion loader override. Root removed only the unused override; initial locked package graph unchanged and frozen install passed.
- Root extended asset review to inline Neofetch artwork and historical reference ZIPs. MIT grant expressly covers project-original design prototypes under the owner's open-source authorization; upstream notices retained. Do not claim the external authorship of downloaded packages.
- Deployment boundary test RED for missing owner/main guard, then GREEN; 24 deployment tests passed.
- Initial baseline validation: 112 unit tests; Astro 0 errors/warnings; demo build and Pagefind index; Chromium 15 passed, 11 real-corpus-only cases explicitly skipped.
- YAML and Bash blocks parse; local documentation links resolve; private environment/key/build paths remain ignored.
- Repository description, homepage, topics and read-only Actions default configured while still private. Fork approval setting requires public visibility and is deferred until that step.
- Production dependency audit found 51 advisory instances including an Astro image-processing critical. The isolated security upgrade then passed and was integrated: Astro7.3.2, compatible React/unified/Sharp/toolchain dependencies, Zod error accessors, and explicit compressHTML:true. The final graph has zero reported vulnerabilities; no advisory suppression is configured.

## Release gates remaining

Finish redacted all-ref/log/artifact secret review and dependency remediation; verify clean clone/current runtime and exact-SHA CI; sync/archive specs; publish the repository and v1.0.0; enable public security controls; read back anonymous source/license/release and private-vault/public-blog state.

OpenSpec impact: open-source-distribution added; product behavior, content schema and manual-preview policy preserved. No Notion writes or production deployment this task.

## Independent all-surface exposure review

Security reviewer completed all11remote branches,7PR refs,52commits,16retained Actions logs,12unexpired artifacts (including15trace ZIPs),historical archives and report images. Gitleaks8.30.1 full-history/archive/current-delta scans returned0findings; targeted review found no credentials, private keys, private notes or unapproved content. Historical public identity, repository names, secret names, deployment hashes and ordinary paths are documented as non-secret configuration. Existing deployment evidence artifacts contain approved public-site or synthetic content and remain retained as part of the explicitly authorized public source release; no blanket deletion or history rewrite is required.

## Integrated candidate validation

Root repeated the frozen install, 112 unit tests, 24 deployment tests, and Astro check (zero errors/warnings; 31 existing schema deprecation hints). The strict 53-post build passed; final browser and all-route geometry evidence is being completed before merge. OpenSpec strict validation passes after correcting the two stale active specifications. Node minimum is 22.12.0.
