# Proposal: R04 add-vitest-unit-layer

## Summary

Add Vitest unit test layer covering pagination, route parsing, content normalization, and terminal command logic modules. This complements existing fixture validation (R03) by providing unit tests for pure business logic functions.

## Motivation

- R03 established the test harness and fixture validation foundation
- Unit tests for pure logic functions (pagination, route helpers, content normalization) are missing
- Terminal command UI has route parsing and navigation logic that needs unit tests
- TDD-governance spec mandates unit test coverage for pure logic

## Scope

### In Scope

- Unit tests for `src/data/pagination.ts` (paginate, parsePageParam, getTotalPages)
- Unit tests for `src/data/blog.ts` (normalizeBlogPost, getPostPath, filterPostsByTag/Category)
- Unit tests for `src/data/contentSource.ts` (property aliases)
- Unit tests for `src/test/env-mock.ts` (already exists, extend coverage)
- Unit tests for route parsing and navigation helpers from TerminalPanel component logic

### Out of Scope

- Component tests (Vitest + Testing Library) - separate task
- E2E tests (Playwright) - separate task
- Fixture validation - covered by R03

## Deliverables

- `src/test/pagination.test.ts` - pagination logic unit tests
- `src/test/blog.test.ts` - blog data normalization unit tests
- `src/test/route.test.ts` - route parsing unit tests (extracted helper functions)
- `openspec/changes/R04-add-vitest-unit-layer/tasks.md` - task checklist
- `openspec/changes/R04-add-vitest-unit-layer/specs/tdd-unit-tests/spec.md` - unit test spec
