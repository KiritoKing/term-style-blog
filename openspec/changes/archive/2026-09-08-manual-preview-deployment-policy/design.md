# Design

## Policy resolution

The resolver treats a missing production flag as false and a missing preview-review value as `manual`. Configuration values are strict: the production flag accepts only `true` or `false`, and preview review accepts only `manual` or `automatic`. Invalid values fail before checkout.

A valid `content_published_changed` event retains its fixed repository, main ref, immutable payload and dispatch-id checks. It resolves to production only when production is true and review is automatic; otherwise it resolves to preview. A manual `production-retry` fails unless those same two gates are satisfied. A manual preview always remains preview.

## Manual preview evidence

All preview modes retain exact snapshot validation, strict metadata and asset checks, browser acceptance against the local built artifact, and local noindex validation. Cloudflare must return a preview deployment environment and a valid Pages URL. Manual policy then writes a GitHub Actions summary that identifies the immutable framework/content snapshot and marks online human acceptance pending.

Manual policy never uses `curl` against the preview. Therefore an Access sign-in page cannot be promoted into evidence that the blog itself rendered. The workflow does not enter production from manual policy.

## Automatic opt-in

The previous preview URL HTML/robots verification remains behind `preview_review == automatic`. Production build and upload require resolved production mode, the true production flag, and automatic review. Existing freshness, immutable snapshot, indexing, serialization and credential boundaries remain in force.
