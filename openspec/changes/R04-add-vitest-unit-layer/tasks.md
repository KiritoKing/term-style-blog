# Tasks: R04 add-vitest-unit-layer

## Implementation Tasks

- [ ] Create `src/test/pagination.test.ts` with pagination logic unit tests
  - Type: unit
  - Spec points: parsePageParam, getTotalPages, paginate functions
  - Acceptance: `pnpm test src/test/pagination.test.ts` passes

- [ ] Create `src/test/blog.test.ts` with blog data normalization unit tests
  - Type: unit
  - Spec points: normalizeBlogPost, getPostPath, filterPostsByTag/Category
  - Acceptance: `pnpm test src/test/blog.test.ts` passes

- [ ] Create `src/test/route.test.ts` with route parsing unit tests
  - Type: unit
  - Spec points: parseRoute, resolveNavigationPath functions
  - Acceptance: `pnpm test src/test/route.test.ts` passes

- [ ] Create `src/test/content-source.test.ts` with content source unit tests
  - Type: unit
  - Spec points: notionBlogPropertyAliases structure validation
  - Acceptance: `pnpm test src/test/content-source.test.ts` passes

- [ ] Extend `src/test/env-mock.test.ts` if needed for edge cases
  - Type: unit
  - Spec points: All env-mock functions
  - Acceptance: `pnpm test src/test/env-mock.test.ts` passes

- [ ] Create `src/test/helpers/route-helpers.ts` extracting pure route functions
  - Type: refactor
  - Purpose: Extract parseRoute and resolveNavigationPath from TerminalPanel for testability
  - Acceptance: Route logic works identically in both TerminalPanel and tests

- [ ] Run full unit test suite
  - Type: validation
  - Command: `pnpm test`
  - Acceptance: All tests pass without Notion API calls

- [ ] Run `pnpm astro check` to verify TypeScript types
  - Type: validation
  - Acceptance: No TypeScript errors

## Test Checklist

### Pagination Logic (5 tests)
- [ ] parsePageParam returns correct integer for valid string
- [ ] parsePageParam returns 1 for invalid/undefined input
- [ ] getTotalPages calculates correct total for various item counts
- [ ] paginate slices array correctly for page 1 and page 2
- [ ] paginate clamps page to valid range when out of bounds

### Blog Data Normalization (5 tests)
- [ ] normalizeBlogPost extracts all metadata fields from mock post
- [ ] getPostPath uses slug when available
- [ ] getPostPath falls back to id when slug is missing
- [ ] filterPostsByTag is case-insensitive
- [ ] filterPostsByCategory is case-insensitive

### Route Parsing (5 tests)
- [ ] parseRoute returns correct section for 'posts'
- [ ] parseRoute extracts slug for 'posts/slug'
- [ ] parseRoute returns home for unknown routes
- [ ] resolveNavigationPath maps all 9 sections to correct paths
- [ ] resolveNavigationPath handles slug-based routes correctly

### Content Source (2 tests)
- [ ] notionBlogPropertyAliases has all required field keys
- [ ] Each alias array is non-empty

### Environment Mock (3 tests - existing, extend)
- [ ] isLocalValidation detects all local command patterns
- [ ] hasValidNotionCredentials rejects placeholder values
- [ ] shouldUseFixtures returns true when credentials invalid

## Dependencies

- R03: test-harness-and-fixtures (completed) - provides test infrastructure
- R02: tdd-governance (completed) - provides test governance rules

## Notes

- Tests must use Markdown fixture source (not Notion)
- Browser APIs (navigator, localStorage) must be mocked
- All tests must be runnable without NOTION_TOKEN or NOTION_DATABASE_ID
