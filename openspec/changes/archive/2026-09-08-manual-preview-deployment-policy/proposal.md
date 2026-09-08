# Change: Make manual preview the default publication policy

## Why

The publication workflow currently treats every valid repository dispatch as a production request and verifies the deployed preview by fetching its public URL. The accepted launch policy requires an immutable Cloudflare preview for human review while production remains disabled. An Access login response is not evidence that the blog rendered correctly.

## What Changes

- Default `PUBLICATION_PRODUCTION_ENABLED` to false and `PUBLICATION_PREVIEW_REVIEW` to `manual`.
- Keep the exact repository dispatch input contract, but resolve it to preview until production is explicitly enabled and automated preview verification is selected.
- Reject production retry unless production is explicitly enabled and preview review is automatic.
- In manual mode, validate the local noindex artifact, deploy the immutable preview, validate Cloudflare deployment outputs, and record online acceptance as pending without fetching the preview URL.
- Preserve the existing URL verification and production sequence only as an explicit automatic opt-in.

## Impact

- Modified capability: `publication-deployment`.
- Implementation is limited to the deployment workflow, input resolver, focused Node tests, specification and agent records.
- No site output, content, credentials, Git remote, dispatch or Cloudflare deployment is changed.
