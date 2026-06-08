# Proposal: R06 add-e2e-test-layer

## Summary

Add Playwright e2e test layer covering core routes, terminal navigation, and basic accessibility smoke tests. This complements the existing unit test layer (R04) by providing browser-level integration tests.

## Why Changes

- R04 established unit tests for pure logic functions
- CI quality gates require e2e tests as part of the acceptance criteria
- Terminal-style UI navigation needs browser-level validation
- Accessibility smoke tests are required per TDD governance

## What Changes

Add Playwright configuration and e2e tests for the blog site.

## Capabilities

### New Capabilities

- `ci-e2e-tests`: Playwright-based end-to-end tests for core blog routes
- `ci-axe-smoke`: Accessibility smoke tests using axe-core

## Impact

- Adds `playwright` and `@playwright/test` as dev dependencies
- Creates `tests/e2e/` directory with Playwright test files
- Creates `playwright.config.ts` for test configuration
- Updates `package.json` with `test:e2e` script

## Scope

### In Scope

- Playwright configuration (`playwright.config.ts`)
- E2E tests for home page, posts listing, about page
- Terminal navigation interaction tests
- Accessibility smoke tests (axe-core)

### Out of Scope

- Full regression suite - covered by R11 and R18
- Notion integration tests
- Performance benchmarks