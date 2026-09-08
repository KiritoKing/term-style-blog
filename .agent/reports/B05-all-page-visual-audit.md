# Report: B05 full generated-page visual audit

Status: accepted; production cutover remains separate.

## Audit boundary

Only the user-approved blog rendering corpus is sent to api.deepseek.com through Midscene 1.12.3. No other vault pages, credentials, health/career documents or desktop screenshots are included. User explicitly approved this destination after automatic approval review initially rejected the external screenshot request.

The audit discovers routes from frozen built HTML. Desktop is 1440×1000; mobile is 390×844. Rendering checks combine actual screenshots/AI assertions, container bounds, browser errors, broken-image detection, and local horizontal scroll reachability. Main-title completeness uses `#content-scroll h1`, never the sidebar brand heading. The reusable runner lives at `scripts/visual-audit/sweep.mjs`; HTTP redirects use `redirects.mjs`.

## Baseline evidence

- Frozen baseline: `/tmp/vault-pipeline-20260909/visual-audit/baseline/dist`.
- Inventory: 266 HTML routes = 104 rendered destinations + 162 redirect stubs.
- Corrected offline run completed 370 visits (208 viewport visits + 162 redirects), no navigation errors. The initial run was invalidated when the preview server crashed on an unencoded Unicode Location header; `scripts/serve-dist.ts` now encodes it correctly.
- Midscene baseline completed all 208 viewport visits, 1276 segments, 9 raw failed visual assertions. Baseline segment sampling was not enough to claim complete vertical coverage; final runner preloads lazy media through actual scrolling and covers every viewport interval.
- All baseline pages also emitted duplicate `initSidebarGrep` declaration errors; B03 repairs this independently of model judgment.
- Broad model wording missed the clipped ROG title. A calibrated assertion naming the actual article title correctly failed. The final runner adds that assertion to every main title.

## Reviewed baseline findings

Confirmed render defects: Unicode terminal autofocus shifts ancestor containers and clips article text; mobile list columns wrap dates/permission strings; Mermaid diagrams become unreadably small with excessive whitespace. B03 owns fixes.

Expected image/scroll behavior: VS Code context menu belongs to the embedded source image; WeClone white blocks are intentional privacy redactions; a heading clipped at a vertical viewport boundary is revealed by further scrolling; wide code uses its own scroll container. Original failures remain in the evidence JSON with separate review classifications.

Historical source defect: `what-is-best-leetcode-lang.md:198` literally contains `【图坏了】`; it is not a browser broken-image element. No replacement image was invented and no body text was rewritten.

## Candidate checks

The first corrected sweep was interrupted because its title query selected the sidebar h1; those title failures are invalid test setup, not product findings. The second run uses the main reading container and has not been marked passing. It already found whole blank viewports inside real Mermaid diagrams after the initial B03 patch; another real-corpus repair is required.

HTTP audit found 12 aliases whose targets return404. Eight are true stale mappings for two renamed articles; root added a failing regression then corrected `20岁随笔` → `birthday-20th` and `评好逸恶劳大学生` → the current full Chinese slug. Four target `mobile-web-dev`, which is explicitly deprecated in the CMS. Preserve its withdrawal and classify its expected404; do not republish deprecated content to make a test green.

## Completion gate

Final report must bind the immutable rendered artifact, exact code/content fingerprints, completed inventory, every failure classification, and post-fix verification. No merge/cutover before the genuine rendering failures are resolved. A model outage or partial run is never a visual pass.

## Source repair: Monorepo original GIF

2026-09-09: Changed only the broken Commitizen GIF URL in `20-writing/published/monorepo.md:535`. Upstream commit afb0ed1de42e0dc21d0086498dd836dbb03636a4 removed docs/images/demo.gif; its parent 2847b8cb16adfae1750cd7ebd4c0b38872a29645 retains the original. The immutable raw GitHub URL returns HTTP200 image/gif (132841 bytes). No illustration was substituted and body semantics/provenance metadata remain unchanged. Actual browser decode and final article rerender remain required.


## Final corrected visual evidence (4327)

- Complete generated inventory:265HTML =103renderedpages +162redirects. The corrected full sweep on4325 completed206/206 desktop/mobile visits and3177 whole-viewport screenshots. Raw193pass/13fail, not an all-pass claim.
- Root inspected every failing class. Actual failures were Mermaid inflation and a removed externalGIF. Four title-wrap assertions and two code-only viewports were model false positives. Original outcomes are preserved in summary.json; classification is separate at `/tmp/vault-pipeline-20260909/visual-audit/reviewed-findings-final.json`.
- Root caught the incomplete first Mermaid repair because full audit used reduced-motion and real external assets. Exact RED on4326 produced10730/3046/6558px diagram widths and44083px AI mobile content height. Root-condition GREEN on4327 produced1011/439/842/304px and18438px; animation/transition override is scoped to Mermaid only. Awaiting fonts also stabilizes renderer measurements.
- Final affected route sweep covers all5Mermaid articles, ROG andMonorepo, both desktop/mobile and light/dark. Each theme completed14/14 viewport visits and394 screenshots. Rawlight11pass/3fail, rawdark12pass/2fail; all5failures independently inspected and classified as fullyvisible title wrapping or the article's historical InvalidImageService code block (source lines173/185), with actual local scroll reachable. No unreviewed model failures remain.
- Scope proof `/tmp/vault-pipeline-20260909/render-fix/4325-4326-4327-v4-scope-proof.json`: all103 bodies unchanged except Monorepo originalGIF URL. Runtime delta is Mermaid-only;8redirectstubs changed for root alias repairs. This preserves all-page visual coverage while explicitly identifying the localized final rerun, rather than falsely calling28visits a second full-site AI sweep.
- Final162HTTPredirects completed with0unexpectedfailures:158destinations200,4expectedretired404forCMSdeprecatedmobile-web-dev. Evidence:final-v4-redirects/redirects.json.
- Full final206/206 viewport geometry run completed at2026-09-08T20:08:53Z:206pass/0fail, no browsererrors, brokenimages, readingcontainer overflow or unreachable local scrollers. Evidence: final-v4-geometry/summary.json.

## Build and source binding

Frozen audited artifact: `/tmp/vault-pipeline-20260909/render-fix/site-b03-v4/dist` at4327. Final shared preview build has exactly the same full artifact fingerprint and zero visiblebody differences across265HTML.

- Production-code fingerprint:df3efd5a21e739b0e69ca265871653db5e2fa1a981f11c5415f886b69e6ba958.
- Audited/preview artifact fingerprint:138dea0b7e644dbc58bfa2ce227761c20d0ddf3c3a11d80e83513c344958d479.
- Strict53-note source tree:7d2ae41c519325a28cfe3ad68e4c202821f4b89819d761ec81c01f8249aeb86c.
- ActualGitHubcontentsnapshot:33f3562c5bcb1198f3506bd8988322bc913e3cd9; manifestSHA256619e6a30f9087a762d3c84105add3b06db02c5183a36ce98781741577155bfed. Root independently read GitHub and matched source hash, proving imageURLchange flowed through normalSync/HermesGitexport.
- Full per-file fingerprints: `/tmp/vault-pipeline-20260909/visual-audit/final-v4-fingerprint.json`.

Final validation:112Vitest,17deploymenttests,17exporter tests; real-corpus19browsercases pass, defaultfixture15pass/11explicitreal-corpusskips. Root finalAstrocheck74files0errors/0warnings/0hints,53articlesvalidated;3existingunresolvedwikilinkwarnings degrade toplain text. Preview buildindexes53 andincludesnoindexpolicy. No productioncutoverorPRmerge occurred.
