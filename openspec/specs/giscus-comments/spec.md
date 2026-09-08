# giscus-comments

## Purpose

为文章详情页提供基于 GitHub Discussions 的评论能力，并限制加载范围与映射方式。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。
## Requirements
### Requirement: 文章详情页必须提供评论区
系统 MUST 在文章详情页展示评论区，以便读者在阅读路径内完成评论与反应操作。

#### Scenario: 访问文章详情页
- **WHEN** 用户访问任意文章详情页
- **THEN** 页面必须在正文下方展示评论区区域

### Requirement: 评论区必须使用 giscus 并基于 GitHub Discussions 存储
系统 MUST 使用 giscus 作为评论系统实现，且评论数据必须存储在指定 GitHub 仓库的 Discussions 中。

#### Scenario: 加载评论数据
- **WHEN** 页面加载评论区
- **THEN** 评论列表必须从 GitHub Discussions 中展示对应 discussion 的评论

### Requirement: 评论区必须只在文章页加载
系统 MUST 仅在文章详情页加载 giscus 脚本与 iframe，禁止在首页、列表页、分类页、标签页与关于页加载该脚本。

#### Scenario: 访问非文章页面
- **WHEN** 用户访问首页、列表页、分类页、标签页或关于页
- **THEN** 页面禁止加载 giscus 脚本与 giscus iframe

### Requirement: 页面与 discussion 的映射必须稳定
系统 MUST 使用 `KiritoKing/notion-astro-rev` 的 `Announcements` category，并按浏览器 pathname 将文章页面关联到既有 discussion。

#### Scenario: 路径映射
- **WHEN** giscus 在 `/posts/<exact-slug>` 初始化
- **THEN** 它必须使用 `pathname` mapping 和历史仓库及 category 标识
