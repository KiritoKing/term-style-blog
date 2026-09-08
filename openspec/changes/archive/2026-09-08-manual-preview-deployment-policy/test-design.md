# Test design

| Layer | Coverage | Command |
| --- | --- | --- |
| input_policy | missing defaults, explicit automatic production opt-in, invalid values, blocked production retry, manual preview | `node --test tests/validate-publication-snapshot.test.mjs` |
| workflow_static | repository variables, manual summary, no manual URL fetch, automatic URL verification, production defense-in-depth | same Node suite |
| regression | immutable input, snapshot, site-mode, dependency pin and credential tests | same Node suite and `pnpm test` |
| yaml_shell | workflow parses and every Bash run block passes `bash -n` | local structural script |
| openspec_validation | complete proposal/design/test/spec/tasks | `openspec validate manual-preview-deployment-policy --strict` |

Tests do not use secrets, network requests, source content, generated site output or deployment APIs.
