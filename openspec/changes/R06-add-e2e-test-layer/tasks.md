# Tasks: R06 add-e2e-test-layer

## Implementation Tasks

- [ ] Install Playwright dependencies
  - Type: dependency
  - Command: `pnpm add -D @playwright/test playwright`
  - Acceptance: Playwright packages installed without errors

- [ ] Install Playwright browsers
  - Type: setup
  - Command: `pnpm playwright install chromium`
  - Acceptance: Chromium browser installed

- [ ] Create `playwright.config.ts` configuration
  - Type: config
  - Spec points: base URL, viewport, timeouts, reporter
  - Acceptance: `pnpm exec playwright test --list` shows test list

- [ ] Create `tests/e2e/home.spec.ts` for home page tests
  - Type: e2e
  - Spec points: Page load, title presence, terminal UI elements
  - Acceptance: `pnpm test:e2e tests/e2e/home.spec.ts` passes

- [ ] Create `tests/e2e/posts.spec.ts` for posts listing tests
  - Type: e2e
  - Spec points: Posts list load, post links, pagination
  - Acceptance: `pnpm test:e2e tests/e2e/posts.spec.ts` passes

- [ ] Create `tests/e2e/about.spec.ts` for about page tests
  - Type: e2e
  - Spec points: About page load, content visibility
  - Acceptance: `pnpm test:e2e tests/e2e/about.spec.ts` passes

- [ ] Create `tests/e2e/a11y.spec.ts` for accessibility smoke tests
  - Type: axe_smoke
  - Spec points: No critical violations on all pages
  - Acceptance: `pnpm test:e2e tests/e2e/a11y.spec.ts` passes

- [ ] Update `package.json` with `test:e2e` script
  - Type: config
  - Script: `playwright test`
  - Acceptance: `pnpm test:e2e` runs all e2e tests

- [ ] Run full e2e test suite
  - Type: validation
  - Command: `pnpm test:e2e`
  - Acceptance: All e2e tests pass

- [ ] Verify local validation still works
  - Type: validation
  - Command: `pnpm validate:local`
  - Acceptance: No TypeScript errors

## Test Checklist

### Home Page Tests (3 tests)
- [ ] Home page loads with HTTP 200
- [ ] Page has visible terminal UI elements
- [ ] Navigation to posts section works

### Posts Listing Tests (3 tests)
- [ ] Posts listing page loads
- [ ] At least one post link is visible and clickable
- [ ] Pagination controls work if present

### About Page Tests (2 tests)
- [ ] About page loads successfully
- [ ] Content sections are visible

### Accessibility Tests (3 tests)
- [ ] Home page has no critical axe violations
- [ ] Posts listing has no critical axe violations
- [ ] About page has no critical axe violations

## Dependencies

- R02: tdd-governance (completed) - provides test governance rules
- R04: add-vitest-unit-layer (completed) - unit test foundation
- R05: stabilize-build-and-env-validation (completed) - build stability

## Notes

- E2e tests use local dev server (http://localhost:4321)
- Tests must not make Notion API calls
- Accessibility tests use @axe-core/playwright
- Browser: Chromium only for CI stability