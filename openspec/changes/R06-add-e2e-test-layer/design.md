# Design: R06 add-e2e-test-layer

## System Structure

### Architecture

```
┌─────────────────────────────────────────────┐
│         Playwright E2E Test Layer            │
├─────────────────────────────────────────────┤
│  tests/e2e/ playwright.config.ts   │
│  ├── home.spec.ts    └── package.json        │
│  ├── posts.spec.ts                             │
│  ├── about.spec.ts                           │
│  └── a11y.spec.ts                            │
└─────────────────────────────────────────────┘
```

### Key Files and Responsibilities

| File | Responsibility |
|------|----------------|
| `playwright.config.ts` | Test runner config: base URL, viewport, timeouts |
| `tests/e2e/home.spec.ts` | Home page load, content, terminal UI presence |
| `tests/e2e/posts.spec.ts` | Posts listing, pagination, navigation |
| `tests/e2e/about.spec.ts` | About page load and content |
| `tests/e2e/a11y.spec.ts` | Accessibility smoke tests via axe-core |

### Test Configuration

- **Base URL**: `http://localhost:4321` (Astro dev server)
- **Viewport**: 1280x720 (desktop)
- **Timeout**: 30s per action, 60s per test
- **Reporter**: List + HTML
- **Workers**: 1 (for local CI stability)

### Interaction Flows

1. **Home page flow**: Load → Check title → Verify terminal UI elements
2. **Posts flow**: Load posts → Navigate pagination → Click post link
3. **About flow**: Load about → Verify content sections
4. **Accessibility flow**: Load each page → Run axe-core checks

### Dependencies

- R02: tdd-governance (completed) - provides test governance rules
- R04: add-vitest-unit-layer (completed) - unit test foundation
- R05: stabilize-build-and-env-validation (completed) - build stability