# Test design

All automated commands clear Notion credentials and use Markdown only. Repository fixtures cover deterministic negative cases. The real corpus gate receives `/Users/chlorinec/Documents/main-vault/20-writing/published` as a read-only external argument and writes only build artifacts inside this worktree.

| Layer | Requirement coverage | Fixture or target |
| --- | --- | --- |
| unit | exact slug, dates, taxonomy, adjacent posts, redirects, wikilinks | typed in-memory objects and repository fixtures |
| fixture_validation | public status/target, duplicate slug, private link, images, empty source | temporary directories created by tests |
| real_corpus | 53 entries, three `publish`, 50 `published`, `KeePass`, all output routes | external vault published directory |
| e2e | terminal help/cd, article reading, metadata, Pagefind Chinese query, Giscus pathname, redirects, mobile overflow | built real-corpus `dist/` served locally |
| openspec_validation | proposal, design, tasks and delta syntax | this change and synchronized specs |

The build gate fails if any Notion request is observed, if the source is empty, if private or non-blog notes enter the collection, if a public route changes case, or if production validation finds an unresolved local or malformed image reference. Preview validation reports those image problems without publishing the referenced file.
