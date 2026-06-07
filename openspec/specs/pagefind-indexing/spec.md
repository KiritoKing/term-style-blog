# pagefind-indexing

## Purpose

定义 Pagefind 索引在构建流程中的生成与依赖固定策略。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 构建产物必须包含 Pagefind 索引资源
系统 MUST 在静态构建输出目录 `dist/` 上运行 Pagefind，并生成 `/pagefind/` 静态资源以随站点发布。

#### Scenario: 构建后生成索引
- **WHEN** 站点构建完成并产出 `dist/`
- **THEN** 系统必须在 `dist/` 上执行 Pagefind 索引
- **THEN** `dist/pagefind/` 目录必须存在并包含索引资源

### Requirement: Pagefind 必须作为开发依赖固定
系统 MUST 将 Pagefind 以 devDependency 的方式写入项目依赖，避免构建时每次从远端拉取。

#### Scenario: 依赖声明
- **WHEN** 检查 `package.json` 依赖列表
- **THEN** `pagefind` 必须出现在 `devDependencies` 中
