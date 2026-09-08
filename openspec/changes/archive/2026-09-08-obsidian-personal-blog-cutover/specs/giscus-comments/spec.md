## MODIFIED Requirements

### Requirement: 页面与 discussion 的映射必须稳定
系统 MUST 使用 `KiritoKing/notion-astro-rev` 的 `Announcements` category，并按浏览器 pathname 将文章页面关联到既有 discussion。

#### Scenario: 路径映射
- **WHEN** giscus 在 `/posts/<exact-slug>` 初始化
- **THEN** 它必须使用 `pathname` mapping 和历史仓库及 category 标识

