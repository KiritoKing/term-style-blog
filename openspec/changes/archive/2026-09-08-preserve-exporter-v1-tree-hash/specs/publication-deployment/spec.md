## ADDED Requirements

### Requirement: Snapshot validation SHALL preserve exporter schema-v1 hash compatibility
The consumer MUST validate `source_tree_hash` using the established exporter schema-v1 serialization order `slug,status,title,path,bytes,sha256` over files globally sorted by relative path, without changing the producer or accepting malformed or modified snapshots.

#### Scenario: An exporter-v1 snapshot is validated
- **WHEN** a synthetic snapshot produced by the actual Deno exporter contains both public statuses, Unicode, nested paths and path-prefix siblings
- **THEN** the consumer SHALL match the exact manifest bytes and source-tree hash
- **THEN** it SHALL report the exact file and status counts

#### Scenario: Recursive traversal order differs from global path order
- **WHEN** the snapshot contains both `a.md` and `a/child.md`
- **THEN** the consumer SHALL compare and hash files in globally sorted relative-path order

#### Scenario: A v1 snapshot is malformed or tampered
- **WHEN** a manifest hash, entry hash, file byte or metadata value does not match the immutable snapshot
- **THEN** validation MUST fail before build or deployment
