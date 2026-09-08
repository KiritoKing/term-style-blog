# Test design

| Layer | Coverage | Command or fixture |
| --- | --- | --- |
| node_unit | exact manifest/file/hash/tree binding; publish and published; tampering, drafts, secrets and local media | `node --test tests/validate-publication-snapshot.test.mjs` using temporary repository-local fixtures |
| input_contract | fixed repositories/branch, full SHAs, hashes, dispatch id and manual modes | exported `resolveInputs` unit cases |
| site_mode | preview noindex and production indexability; reject preview artifact as production | generated minimal HTML/robots fixtures |
| workflow_static | pinned action SHAs, read-only permissions, preview ordering, production rebuild/freshness/concurrency, explicit Node suite invocation | Node assertions plus YAML parse and extracted Bash syntax checks |
| integration_wiring | package script and both CI/deployment workflows reference existing commands/files | repository search and direct command execution |
| openspec_validation | proposal/design/spec/tasks structure | `openspec validate integrate-publication-deployment --strict` |

Tests do not read credentials, query remote repositories, call Cloudflare, rebuild `dist`, or change the source vault.
