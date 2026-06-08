# test-harness-and-fixtures

## Purpose

定义测试夹具、env mock 和本地验证工具链，使本地开发和 CI 可以在不依赖真实 Notion 凭据的情况下运行验证命令。

## Requirements

### Requirement: Markdown fixture source for local validation
系统 MUST 在 `src/fixtures/blog/` 目录下提供 Markdown fixture 文件，这些文件的内容模式必须与 Notion `blog` 集合的 schema 保持一致。

#### Scenario: Fixture directory contains valid posts
- **WHEN** 本地验证流程访问 `src/fixtures/blog/` 目录
- **THEN** 目录下存在至少三篇符合 schema 的 Markdown fixture 文件

#### Scenario: Fixture frontmatter matches Notion schema
- **WHEN** 解析 `src/fixtures/blog/` 下的任意 fixture 文件
- **THEN** frontmatter 包含 `id`、`slug`、`title`、`date`、`category`、`tags` 字段
- **AND** `id` 是有效的 UUID 格式
- **AND** `date` 是有效的 ISO 8601 日期格式

### Requirement: Environment mock detection
系统 MUST 提供环境检测工具，用于判断当前执行上下文是否为本地验证模式。

#### Scenario: Local validation detection
- **WHEN** 执行 `pnpm validate:local` 命令
- **THEN** `isLocalValidation()` 函数返回 `true`
- **AND** 系统不会尝试连接 Notion API

#### Scenario: Production build detection
- **WHEN** 执行 `pnpm build` 命令
- **THEN** `isLocalValidation()` 函数返回 `false`
- **AND** 系统使用真实的 Notion 内容源

### Requirement: Fixture validation harness
系统 MUST 提供 fixture 验证工具，可以验证 fixture 文件的结构完整性而不发起网络请求。

#### Scenario: Fixture schema validation
- **WHEN** 运行 `pnpm test:fixtures` 或等效验证命令
- **THEN** 每个 fixture 文件可以被解析为有效的 BlogPost 结构
- **AND** 没有 Notion API 请求被发出

#### Scenario: Fixture count validation
- **WHEN** 运行 fixture 验证
- **THEN** 验证报告包含 fixture 数量和状态摘要

### Requirement: Local validation script
系统 MUST 在 `package.json` 中提供 `validate:local` 脚本，该脚本在 Notion 凭据缺失或无效时使用 fixture 源。

#### Scenario: Validate local without credentials
- **WHEN** 执行 `env NOTION_TOKEN= NOTION_DATABASE_ID= pnpm validate:local`
- **THEN** 命令成功完成
- **AND** 不报告 Notion API 错误

#### Scenario: Validate local with invalid credentials
- **WHEN** 执行 `env NOTION_TOKEN=invalid NOTION_DATABASE_ID=invalid pnpm validate:local`
- **THEN** 命令成功完成
- **AND** 不报告 Notion API 错误

### Requirement: No Notion API calls in local validation
系统 MUST 确保本地验证流程不会发起 Notion API 请求。

#### Scenario: Network isolation verification
- **WHEN** 监控 `pnpm validate:local` 的网络活动
- **THEN** 没有发往 Notion API 域名的请求
- **AND** 没有发往 `api.notion.com` 的请求

## Acceptance Tests

```bash
# Local validation without credentials
env NOTION_TOKEN= NOTION_DATABASE_ID= pnpm validate:local

# Local validation with invalid credentials  
env NOTION_TOKEN=*** NOTION_DATABASE_ID=invalid pnpm validate:local

# Fixture validation tests
pnpm test:fixtures
```

## Implementation Notes

- Fixtures 使用与 Notion schema 对齐的 frontmatter 字段
- Env mock 通过命令行参数检测本地验证上下文
- 本地验证脚本优先检查 fixture 目录而非 Notion API