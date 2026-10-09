# Report: DEP01 Dependabot safe review

Status: review
Authorization: owner authorizes safe upgrades and approve, never merge. Latest main7577a11e and PR24afb1a845 verified unchanged.

PR20 old head946feab404080d034359c7cdeab3463e9c84cde3 conflicted with latest main and would lose PR24 newer security patches. Refreshed using a non-force merge of PR24; resolve package/lock from reviewed base, apply10 outstanding compatible direct ranges and regenerate pnpm10.28 lock. Astro7.3.8/Markdown7.3.2/Sharp0.35.5 stay. Installed Iconify1.2.142 is a compatible patch within requested^1.2.140. http-cache4.3 range update reduces audit4→3, but max-stale official patch is unconfirmed and risk retained. No overrides, application source or deployment gate change.

Validation on implementation63a65acf061e72875d9c5d7c0efa85ec7be5377b:
- frozen install,122unit,56deployment,check0errors/0warnings/31existinghints pass.
- template/owner synthetic builds pass; Chromium33/32 pass with12/13private-corpus skips, including search, Mermaid, light/dark desktop/mobile images/pinch/navigation/focus, noJS and axe smoke.
- audit3(2moderate1low); diffcheck pass. No private content or service access.
- Remote final-head CI and approve pending; PR20 is stacked on PR24 to avoid downgrade/conflicting old lock. PR16 will be refreshed on this accepted dependency base and independently checked. PR22Sharp is already covered by PR24, obsolete conflicted head is not approved. PR18d842d... independent action/source/CI checks pass; isolated public deployment adds a smoke before approve.

Files: package.json,pnpm-lock.yaml,dependency risk docs,state reports.
OpenSpec impact: no product behavior contract changes; existing dependency maintenance/fixture/publication/typography specs apply. This maintenance does not create a new behavior specification.
Risks and follow-ups: three advisories plus retained unconfirmed http-cache high-risk note are detailed in docs/dependency-review.md. Browser coverage Chromium only. Owner handles review/merge order and official Portal authentication.

PR16 refresh: merge PR20add0d508 without force, retain its lock security patches and resolve Lucide1.52.0 only. Implementationaae83674c384cc9dbb33d0dfc9411b61bc65aff6 differs from PR20onlypackage/lock. Officialv1migration removes brand icons; all14usedESMicons are non-brand, existing explicitaria-hidden/focusable,size16/strokeWidth2 remain. Frozen/unit122/deployment56/check0errors0warnings31hints,template33/owner32Chromium(with12/13private-skips) andbothsyntheticbuilds pass. FinalheadCI/approvepending. No productcontractchange/specdelta needed.
