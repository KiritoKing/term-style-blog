## Why

The reusable theme has a protected review preview but no anonymous catalogue demo. The owner now explicitly authorizes a dedicated Cloudflare Pages project using the existing controlled deployment capability, without changing the personal blog or Access.

## What Changes

- Build only the neutral repository Markdown demo and bind all output to the exact reviewed source SHA.
- Check the existing account project count and free static-asset limits before creating one dedicated Direct Upload project.
- Deploy only the non-production public-demo branch and verify anonymous HTML, image interaction, themes, mobile layout and noindex policy without Access credentials.
- Preserve the production publication workflow, protected origin guard, private content and credential boundaries.

## Capabilities

### New Capabilities
- `public-theme-demo`: Dedicated synthetic-only Pages hosting, bounded creation and anonymous SHA-bound acceptance.

### Modified Capabilities
None; existing publication and protected-preview duties remain unchanged.

## Impact

New controlled workflow, deployment/verification scripts, Node regression tests and documentation. No client JavaScript, direct dependency, credential, OAuth, DNS, Access policy or paid-service change.
