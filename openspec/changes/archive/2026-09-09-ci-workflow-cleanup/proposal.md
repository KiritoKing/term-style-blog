# CI workflow cleanup

## Why
The owner requested clearer CI and an explanation of the live Sync-to-deployment trigger chain. A legacy Vercel demo still produces deployments and PR checks alongside Cloudflare. Newly enabled security/update automation adds legitimate activity that needs clear separation.

## What Changes
- Disable legacy Vercel automatic Git deployments through repository configuration.
- Name code validation and Cloudflare publication workflows clearly; keep their triggers and security gates.
- Group routine dependency updates on a predictable weekly schedule, retaining immediate security updates and CodeQL coverage.
- Document the live publication triggers and actors from read-only Hermes/GitHub verification.

## Capabilities
### New Capabilities
- `ci-workflow-roles`: one publication destination with distinct validation, security and dependency maintenance roles.

## Impact
.github workflow names/run titles, Dependabot configuration, vercel.json, deployment documentation, OpenSpec and agent records. Preserve required verify status, all test gates, production policy, live site and private vault. Do not delete historical run evidence or disable security checks to reduce UI activity.
