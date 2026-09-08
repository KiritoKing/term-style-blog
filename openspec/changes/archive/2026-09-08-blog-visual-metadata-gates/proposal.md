# Strict metadata and complete page visual verification

## Why

The real ROG Ally article rendered an empty historical category as Uncategorized and its long encoded route overflowed the terminal prompt. A document-width-only check missed clipped child content. These defects invalidate the previous release acceptance.

## What Changes

- Require a meaningful category for both publish and published, with no historical exemption or display fallback; reject invalid metadata before rendering and export.
- Repair container-level overflow while preserving the terminal visual style, controls and readable scrolling.
- Enumerate every generated HTML route. Verify historical redirects separately and inspect every rendered destination at desktop and mobile widths with local geometry checks, screenshots and Midscene visual assertions.

## Impact

B03 owns rendering components/styles and browser regression tests; B04 owns content schema, metadata validators and unit tests including the vault exporter; B05 root owns the full-route audit, specifications and shared registry. No production deployment until these checks pass. Real missing metadata is inventoried before any source correction; article prose is preserved.
