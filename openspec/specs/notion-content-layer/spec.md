# notion-content-layer

## Purpose

记录 Notion 历史来源字段的保留边界；运行时内容源已迁移为 Obsidian Markdown 发布快照。
## Requirements
### Requirement: Notion 仅保留为历史来源
系统 MUST 保留已存在的 `source_notion_url` 和 `source_notion_id` 来源字段，且生产与本地构建 MUST NOT 请求 Notion API。

#### Scenario: 渲染从 Notion 迁入的文章
- **WHEN** 发布快照包含历史 Notion 来源字段
- **THEN** 页面从 Markdown 内容生成，不依赖 Notion 凭据或在线可用性
