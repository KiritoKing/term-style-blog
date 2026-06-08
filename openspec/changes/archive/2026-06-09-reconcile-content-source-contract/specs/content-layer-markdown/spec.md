## MODIFIED Requirements

### Requirement: 博客内容层模型
系统 MUST 在 Astro content layer 中定义博客集合与字段约束，并生成可用于构建期查询的类型安全 API；该模型的生产内容源必须与 Notion 内容源契约保持一致。

#### Scenario: 构建期内容索引
- **WHEN** 站点进行构建
- **THEN** 内容层必须产出可查询的博客集合索引与类型定义

### Requirement: Markdown 内容存储
系统 MUST NOT 将本地 Markdown 文件作为生产博客文章的规范存储来源；Markdown 文件只能作为非生产示例或未来测试夹具，且不得被生产 `blog` 集合 loader 读取。

#### Scenario: 新增 Markdown 示例
- **WHEN** 新增一篇 Markdown 示例或测试夹具
- **THEN** 内容层不得在生产构建时将其纳入 `blog` 集合

#### Scenario: 生产构建读取内容源
- **WHEN** 生产构建读取 `src/content.config.ts`
- **THEN** `blog` 集合必须使用 Notion loader 而不是 Markdown glob loader
