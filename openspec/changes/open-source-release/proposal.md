# Open-source release

## Why
The deployed personal blog repository is private, unlicensed and lacks a usable public entry point. Its environment example still instructs readers to configure Notion even though current builds use Markdown.

## What Changes
- Publish the source under MIT after independent history, secret and attribution review.
- Provide Chinese/English getting started, content/deployment guides, contribution and private security-reporting instructions.
- Correct package metadata, environment examples and ignore rules; retain personal configuration as explicit fork customization points.
- Pin CI actions, guard owner-only publication, configure public repository metadata and security settings, and publish a tagged first release.
- Preserve the production site, private vault, content synchronization and manual-preview policy.

## Capabilities
### New Capabilities
- `open-source-distribution`: reproducible secret-free local development, attribution, and safe public contribution boundaries.
### Modified Capabilities
- `test-harness-and-fixtures`: align stale documentation with the already implemented Markdown/demo selection; no content-source behavior change.
- `tdd-governance`: normalize active-spec formatting and attach existing scenarios; preserve policy.
- Publication inputs and intended product rendering remain unchanged.

## Impact
README, LICENSE/NOTICE, contributor/security documents, docs, package.json, .env.example, .gitignore, .github configuration, agent records and repository settings. Public exposure includes all reachable Git refs and Actions history; visibility is the final step after review and verification. Do not rewrite history or delete runs unless a concrete sensitive finding requires remediation with a private backup.
