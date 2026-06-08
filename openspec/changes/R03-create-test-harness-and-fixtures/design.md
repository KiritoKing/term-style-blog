# Design: R3 Create Test Harness and Fixtures

## Overview

This change creates a test harness that enables local validation without Notion credentials by establishing a Markdown fixture source that mirrors the Notion content schema.

## System Structure

### Fixture Directory Structure

```
src/fixtures/
  blog/                      # Markdown fixture posts
    hello-world.md           # Basic post fixture
    learning-rust.md          # Multi-tag post fixture
    pixel-art-tips.md         # Category post fixture
  schema.ts                  # Fixture schema definition
  index.ts                   # Fixture loader utilities

src/test/
  fixtures.test.ts           # Fixture validation tests
  env-mock.test.ts           # Environment mock tests

tests/
  fixtures/                  # Test data for integration tests
```

### Environment Mock Strategy

The `src/test/env-mock.ts` module provides:
- `isLocalValidation()`: Detects if current command is a local validation context
- `getFixturePost()`: Returns fixture post by slug
- `getAllFixturePosts()`: Returns all fixture posts

### Fixture Schema

Fixtures use frontmatter matching the Notion content schema:

```typescript
interface BlogPostFixture {
  id: string;           // UUID
  slug: string;         // URL slug
  title: string;        // Post title
  date: string;        // ISO date
  category: string;     // Primary category
  tags: string[];      // Tags array
  summary?: string;     // Optional summary
  content: string;     // Markdown body
}
```

### Validation Harness

The `validate:local` script:
1. Checks for Notion credentials
2. If credentials missing/invalid and local mode, uses fixtures
3. Runs `pnpm astro check` with fixture content
4. Reports validation results

## Key Files and Responsibilities

| File | Responsibility |
|------|---------------|
| `src/fixtures/blog/*.md` | Markdown fixture posts |
| `src/fixtures/schema.ts` | Zod schema for fixture validation |
| `src/fixtures/index.ts` | Fixture loading utilities |
| `src/test/env-mock.ts` | Environment detection and fixture access |
| `src/test/fixtures.test.ts` | Vitest tests for fixtures |
| `src/test/env-mock.test.ts` | Tests for env mock utilities |
| `package.json` | Added `validate:local` script |

## Test Strategy

### Unit Tests (Vitest)

1. **Fixture Schema Validation**
   - Each fixture parses without errors
   - All required fields present
   - Field types match schema

2. **Environment Mock Tests**
   - `isLocalValidation()` correctly detects context
   - Fixture getter functions return expected data

### Integration Tests

1. **Local Validation Harness**
   - `pnpm validate:local` succeeds without Notion credentials
   - No Notion API requests are made during validation

## OpenSpec Alignment

This change implements requirements from:
- `openspec/specs/notion-content-layer/spec.md`: "支持非生产内容校验兜底" requirement
- `openspec/specs/content-layer-markdown/spec.md`: "Markdown 文件只能作为非生产示例或未来测试夹具"
- `openspec/specs/tdd-governance/spec.md`: Test infrastructure requirements

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Fixtures drift from Notion schema | Fixture validation tests catch schema mismatches |
| Tests use wrong content source | Env mock ensures fixture mode in tests |
| Local validation passes but production fails | Clear separation in scripts and documentation |

## Dependencies

- R1 (content source contract) - establishes schema baseline
- R2 (TDD governance) - test requirements framework