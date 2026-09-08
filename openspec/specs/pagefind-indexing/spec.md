# pagefind-indexing

## Purpose

定义 Pagefind 索引在构建流程中的生成与依赖固定策略。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。
## Requirements
### Requirement: 构建产物必须包含 Pagefind 索引资源
系统 MUST 在静态构建后对 `dist/` 运行 Pagefind，并通过页面标记只索引准出文章正文和公开导航。

#### Scenario: 构建后生成索引
- **WHEN** 站点完成外部 Markdown 快照构建
- **THEN** `dist/pagefind/` 必须包含当前快照中全部准出文章的可搜索索引
- **THEN** 私有字段与非准出文件不得进入索引

### Requirement: Pagefind 必须作为开发依赖固定
系统 MUST 将 Pagefind 以 devDependency 的方式写入项目依赖，避免构建时每次从远端拉取。

#### Scenario: 依赖声明
- **WHEN** 检查 `package.json` 依赖列表
- **THEN** `pagefind` 必须出现在 `devDependencies` 中
