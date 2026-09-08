## MODIFIED Requirements

### Requirement: 构建产物必须包含 Pagefind 索引资源
系统 MUST 在静态构建后对 `dist/` 运行 Pagefind，并通过页面标记只索引准出文章正文和公开导航。

#### Scenario: 构建后生成索引
- **WHEN** 站点完成外部 Markdown 快照构建
- **THEN** `dist/pagefind/` 必须包含当前快照中全部准出文章的可搜索索引
- **THEN** 私有字段与非准出文件不得进入索引
