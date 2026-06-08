## 1. Contract Artifacts

- [x] 1.1 Create proposal, design, and delta specs that declare Notion as the production `blog` collection source.
- [x] 1.2 Validate the R1 OpenSpec change with strict validation.

## 2. Source Contract Implementation

- [x] 2.1 Add a reusable content source contract for the production source, collection name, and Notion property aliases.
- [x] 2.2 Update post normalization to use the shared Notion property alias contract.
- [x] 2.3 Update `src/content.config.ts` so the Notion loader has an explicit entry schema and Markdown files remain outside the production loader.
- [x] 2.4 Add a non-production empty-collection fallback for local validation when Notion credentials are missing or rejected.

## 3. Validation and Closeout

- [x] 3.1 Run OpenSpec validation for the change and all specs.
- [x] 3.2 Run Astro and diff validation commands or record any credential-related blocker.
- [x] 3.3 Sync delta specs into main specs, archive the change, and update `.agent` report and handoff state.
