## MODIFIED Requirements

### Requirement: 搜索结果必须体现 grep 风格的路径与片段
系统 MUST 安全展示 Pagefind 返回的文章路径、标题与高亮片段，并明确展示加载中、空查询、无结果和索引不可用状态。

#### Scenario: 中文搜索命中
- **WHEN** 用户提交能命中公开文章的中文查询
- **THEN** 搜索页必须显示文章 canonical path 与匹配片段

