# tdd-unit-tests

## Purpose

Define unit test coverage requirements for pure logic modules in the term-style-blog project.

## ADDED Requirements

### Requirement: Pagination logic unit tests

System MUST provide unit tests for `src/data/pagination.ts` functions covering normal and edge cases.

#### Scenario: parsePageParam with valid input
- **WHEN** `parsePageParam('3')` is called
- **THEN** it returns `3`

#### Scenario: parsePageParam with invalid input
- **WHEN** `parsePageParam(undefined)`, `parsePageParam('abc')`, `parsePageParam('-1')` is called
- **THEN** it returns `1`

#### Scenario: getTotalPages calculation
- **WHEN** `getTotalPages(25, 10)` is called
- **THEN** it returns `3`
- **AND** `getTotalPages(0, 10)` returns `1`

#### Scenario: paginate basic slicing
- **WHEN** `paginate([1,2,3,4,5], { page: 1, perPage: 2 })` is called
- **THEN** it returns `{ items: [1,2], page: 1, totalPages: 3, hasPrev: false, hasNext: true }`

#### Scenario: paginate page bounds
- **WHEN** `paginate([1,2,3], { page: 99, perPage: 2 })` is called
- **THEN** it clamps page to `2` (last page)

### Requirement: Blog data normalization unit tests

System MUST provide unit tests for `src/data/blog.ts` functions.

#### Scenario: normalizeBlogPost extracts all fields
- **WHEN** `normalizeBlogPost` is called with a mock BlogPost
- **THEN** it returns BlogMeta with id, title, date, category, tags, description

#### Scenario: getPostPath prefers slug over id
- **WHEN** `getPostPath` is called with `{ slug: 'my-post', id: 'abc' }`
- **THEN** it returns `/posts/my-post`
- **AND** `getPostPath` with `{ id: 'abc' }` (no slug) returns `/posts/abc`

#### Scenario: filterPostsByTag is case-insensitive
- **WHEN** `filterPostsByTag([{ tags: ['JavaScript'] }], 'javascript')` is called
- **THEN** it returns the matching post

#### Scenario: filterPostsByCategory is case-insensitive
- **WHEN** `filterPostsByCategory([{ category: 'DevOps' }], 'devops')` is called
- **THEN** it returns the matching post

### Requirement: Content source unit tests

System MUST provide unit tests for `src/data/contentSource.ts` constant exports.

#### Scenario: notionBlogPropertyAliases structure
- **WHEN** `notionBlogPropertyAliases` is accessed
- **THEN** it contains keys for title, slug, date, category, tags, description
- **AND** each value is a non-empty array of strings

### Requirement: Route parsing unit tests

System MUST provide unit tests for route parsing logic (extracted as pure functions).

#### Scenario: parseRoute identifies section
- **WHEN** `parseRoute('posts')` is called
- **THEN** it returns `{ section: 'posts' }`
- **AND** `parseRoute('posts/abc')` returns `{ section: 'post', slug: 'abc' }`

#### Scenario: resolveNavigationPath maps sections to paths
- **WHEN** `resolveNavigationPath({ section: 'home' })` is called
- **THEN** it returns `/`
- **AND** `resolveNavigationPath({ section: 'post', slug: 'xyz' })` returns `/posts/xyz`

#### Scenario: resolveNavigationPath covers all sections
- **WHEN** each RouteContext variant is passed to `resolveNavigationPath`
- **THEN** it returns the corresponding path for all 9 sections

### Requirement: Environment mock unit tests

System MUST extend existing unit tests for `src/test/env-mock.ts`.

#### Scenario: isLocalValidation detects command patterns
- **WHEN** process.argv contains 'check', 'validate:local', 'test:fixtures'
- **THEN** `isLocalValidation()` returns `true`
- **AND** `isLocalValidation()` returns `false` for unrelated commands

#### Scenario: hasValidNotionCredentials validates env vars
- **WHEN** NOTION_TOKEN or NOTION_DATABASE_ID is missing/placeholder
- **THEN** `hasValidNotionCredentials()` returns `false`
- **AND** with valid values it returns `true`

#### Scenario: shouldUseFixtures combines conditions
- **WHEN** local validation is active OR credentials are invalid
- **THEN** `shouldUseFixtures()` returns `true`
- **AND** it returns `false` when both conditions are false

### Requirement: Test file location

Unit test files MUST be located in `src/test/` directory and follow the naming pattern `*.test.ts`.

### Requirement: Test isolation

Unit tests MUST:
- Use Vitest with `vitest run` command
- Not depend on external APIs or file system (except fixture loading tests)
- Be runnable without Notion credentials
- Use mocking for browser APIs (navigator, localStorage)
