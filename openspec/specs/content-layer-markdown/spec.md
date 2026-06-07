# content-layer-markdown

## Purpose

定义 Astro 内容层在 Markdown 博客中的数据模型与内容来源，确保构建期可索引并提供类型安全查询。

## Requirements

### Requirement: 博客内容层模型
系统 MUST 在 Astro content layer 中定义博客集合与字段约束，并生成可用于构建期查询的类型安全 API。

#### Scenario: 构建期内容索引
- **WHEN** 站点进行构建
- **THEN** 内容层必须产出可查询的博客集合索引与类型定义

### Requirement: Markdown 内容存储
系统 MUST 将所有博客文章以 Markdown 文件存储在约定的内容目录中，并由内容层统一读取。

#### Scenario: 新增文章
- **WHEN** 新增一篇 Markdown 博客文章
- **THEN** 内容层必须在构建时读取并纳入博客集合
