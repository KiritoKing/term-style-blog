# content-layer-markdown

## Purpose

定义 Astro 内容层使用 Obsidian Markdown 发布快照的数据模型、生产构建和离线验证边界。
## Requirements
### Requirement: 博客内容层模型
系统 MUST 在 Astro content layer 中定义博客集合与字段约束，生产内容源为通过准出门禁的外部 Markdown 发布快照；本地验证默认使用仓库 Markdown fixtures，不读取 Notion。

#### Scenario: 构建期内容索引
- **WHEN** 站点进行构建
- **THEN** 内容层必须产出可查询的博客集合索引与类型定义

### Requirement: Markdown 内容存储
系统 MUST 在构建期从显式外部发布快照读取 `.md` 文件，并将通过博客准出门禁的文件定义为 `blog` 内容集合；生产构建不得读取 Notion 或回退为空站。

#### Scenario: 使用外部发布快照
- **WHEN** `CONTENT_DIR` 指向有效快照目录
- **THEN** 构建必须从该目录读取 Markdown
- **THEN** 每篇文章必须由 Astro 静态渲染
