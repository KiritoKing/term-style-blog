## REMOVED Requirements

### Requirement: 使用 Notion 数据库作为内容源
**Reason**: The approved architecture makes Obsidian Markdown publication snapshots the sole source of truth and removes build-time Notion availability and credential risk.
**Migration**: Set `CONTENT_DIR` to an immutable exported publication snapshot and run the Markdown content validator before the static build.

### Requirement: 保持集合字段结构稳定
**Reason**: Notion property aliases are replaced by the publication frontmatter schema.
**Migration**: Read fields through the Markdown publication model while preserving historical source IDs.

### Requirement: 支持非生产内容校验兜底
**Reason**: Offline checks use explicit Markdown fixtures; no credential-based empty collection fallback remains.
**Migration**: Use repository fixtures for offline checks and reject absent external sources for publication builds.

### Requirement: 支持 Notion 文件图片的构建期处理
**Reason**: Publication images use stable public URLs; builds no longer fetch expiring Notion files.
**Migration**: Repair historical media before export and preserve remote image URLs during rendering.

## ADDED Requirements

### Requirement: Notion 仅保留为历史来源
系统 MUST 保留已存在的 `source_notion_url` 和 `source_notion_id` 来源字段，且生产与本地构建 MUST NOT 请求 Notion API。

#### Scenario: 渲染从 Notion 迁入的文章
- **WHEN** 发布快照包含历史 Notion 来源字段
- **THEN** 页面从 Markdown 内容生成，不依赖 Notion 凭据或在线可用性
