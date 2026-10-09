## Why

The source currently boots as the owner's personal blog, with scattered identity/comment/redirect settings and personal screenshots. A reusable Astro theme needs neutral defaults, a single customization entry and preserved owner production behavior before catalogue submission.

## What Changes

- Add typed template/Chlorine profiles in a single site.config.ts entry; neutral identity, comments off and no inherited redirects by default.
- Select the existing owner profile explicitly only in its protected publication build; retain origin, author, Giscus mapping, biography, network and all 162 redirects.
- Centralize shell/terminal/metadata/configuration and document generic static deployment.
- Upgrade compatible Astro/Sharp patches, inspect dependency advisories and safely scan tracked source/history without exposing credentials.
- Replace marketing screenshots with synthetic demo screenshots; prepare accurate English Portal submission material and an isolated authenticated review preview.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `open-source-distribution`: neutral, documented and rights-cleared reusable defaults; owner pipeline remains isolated.
- `personal-site-metadata`: metadata follows selected configuration while preserving owner profile.
- `giscus-comments`: optional per-profile comments; owner mapping retained.
- `historical-url-compatibility`: owner aliases retained, template starts without inherited aliases.

## Impact

Root configuration, existing data wrappers and shell/metadata/comment consumers, build redirect generation, bounded workflow profile/isolated preview changes, compatible dependencies, tests/docs/synthetic screenshots. No production operation, Access removal, new hosting setup, OAuth, login or catalogue submission.
