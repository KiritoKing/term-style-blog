# test-harness-and-fixtures

## Purpose

定义独立测试夹具、演示内容与本地验证工具链。与 publication-snapshot-source 保持一致：当前构建使用 Markdown，不读取 Notion；本规格更新清除已移除的环境 mock 与历史 Notion 构建说明。

## Requirements

### Requirement: Markdown fixture source for local validation
系统 MUST 在 `src/fixtures/blog/` 保留独立 schema 测试夹具，并在 `src/content/blog/` 提供可供默认站点构建使用的准出格式演示文章。

#### Scenario: Fixture directory contains valid posts
- **WHEN** fixture 测试访问 `src/fixtures/blog/`
- **THEN** 目录中至少有三篇符合 `blogPostFixtureSchema` 的合成文章
- **AND** fixture 字段包括 UUID `id`、slug、title、date、category 和 tags

#### Scenario: Default site build uses demo articles
- **WHEN** 本地未设置 `CONTENT_DIR` 并执行构建
- **THEN** 站点 MUST 从 `src/content/blog/` 读取演示文章
- **AND** 演示文章遵守当前 publish/published 与 publish.target 的发布门禁

### Requirement: Explicit content source selection
系统 MUST 根据 `CONTENT_DIR` 显式选择外部 Markdown，缺省使用演示内容；Notion 环境变量不得改变该选择。

#### Scenario: Validate without external content
- **WHEN** 开发者执行 `pnpm check`、`pnpm build` 或 `pnpm validate:local` 且未设置 `CONTENT_DIR`
- **THEN** 命令使用仓库演示内容，不需要服务凭据

#### Scenario: Validate an external publication build
- **WHEN** 执行 `pnpm build:content`
- **THEN** 系统 MUST 要求 `CONTENT_DIR` 并校验指定目录
- **AND** 缺失目录配置时不得退回演示文章

### Requirement: Fixture validation harness
系统 MUST 提供离线 schema 验证工具，使用合成数据检查 fixture 结构和已知边界，不依赖外部 API 响应。

#### Scenario: Fixture schema and count validation
- **WHEN** 执行 `pnpm test:fixtures` 或 `pnpm test`
- **THEN** 每个 fixture 可以被解析为声明的数据结构
- **AND** 测试校验数量、日期、UUID、slug、标题和分类

### Requirement: Local validation script
系统 MUST 提供 `pnpm validate:local` 和更完整的 `pnpm check`，用于 Astro/TypeScript 检查；`pnpm check` 还执行内容前置校验。

#### Scenario: Validate with missing or unrelated Notion credentials
- **WHEN** Notion 环境变量缺失或设置为无效占位值
- **THEN** 本地检查 MUST 不因这些变量失败，也不得调用 Notion API

### Requirement: No Notion API calls in local validation
默认单测、部署校验测试、类型检查、fixture 构建和浏览器 CI MUST 使用合成或演示内容，不读取真实 Notion 数据或私密 vault。

#### Scenario: CI validates a public pull request
- **WHEN** 一个 pull request 触发默认 CI
- **THEN** CI 使用仓库内容和只读权限完成验证
- **AND** 不需要 Notion、Cloudflare 或私密内容仓库凭据
