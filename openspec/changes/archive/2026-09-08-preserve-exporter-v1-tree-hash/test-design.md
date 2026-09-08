# Test design

| Layer | Coverage | Command |
| --- | --- | --- |
| exporter_golden | Actual Deno exporter output; publish/published, Unicode, nested paths, `a.md` plus `a/child.md` | `pnpm test:deployment` |
| red_green | Unfixed consumer rejects golden; fixed consumer returns exact file/status counts and v1 tree hash | same suite |
| tamper | Manifest hash mismatch, malformed v1 field hash, content byte tampering, file set changes | same suite |
| regression | Immutable input and manual-preview/production policy cases remain green | same suite |
| exact_snapshot | Read-only checkout of content SHA `524b6709...` validated with fixed manifest and tree hashes | direct Node validator command in owned temp |
| openspec | Strict change validation before archive and strict base-spec validation after sync | `openspec validate preserve-exporter-v1-tree-hash --strict` |

The golden fixture is synthetic. The exact 54-file snapshot and any source text remain outside Git under `/tmp/vault-pipeline-20260909/v1-compatibility`.
