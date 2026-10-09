## MODIFIED Requirements

### Requirement: 文章详情页必须提供评论区
系统 MUST 在配置了 giscus 的 profile 的文章详情页展示评论区；默认模板 MUST 关闭评论且不输出评论 island、脚本或 iframe。

#### Scenario: 访问文章详情页
- **WHEN** 用户访问配置了 giscus 的文章详情页
- **THEN** 页面必须在正文下方展示评论区区域

### Requirement: 评论区必须使用 giscus 并基于 GitHub Discussions 存储
启用评论时系统 MUST 使用 giscus 作为评论系统实现，且评论数据必须存储在指定 GitHub 仓库的 Discussions 中。

#### Scenario: 加载评论数据
- **WHEN** 页面加载评论区
- **THEN** 评论列表必须从 GitHub Discussions 中展示对应 discussion 的评论

### Requirement: 评论区必须只在文章页加载
系统 MUST 仅在文章详情页加载 giscus 脚本与 iframe，禁止在首页、列表页、分类页、标签页与关于页加载该脚本。

#### Scenario: 访问非文章页面
- **WHEN** 用户访问首页、列表页、分类页、标签页或关于页
- **THEN** 页面禁止加载 giscus 脚本与 giscus iframe

### Requirement: 页面与 discussion 的映射必须稳定
`chlorine` profile 的系统 MUST 使用 `KiritoKing/notion-astro-rev` 的 `Announcements` category，并按浏览器 pathname 将文章页面关联到既有 discussion。

#### Scenario: 路径映射
- **WHEN** `chlorine` profile 的 giscus 在 `/posts/<exact-slug>` 初始化
- **THEN** 它必须使用 `pathname` mapping 和历史仓库及 category 标识

#### Scenario: Configure a fork's comments
- **WHEN** a template author enables giscus in the typed configuration
- **THEN** the article SHALL use that configured repository and category with pathname mapping and same-origin terminal theme URLs
