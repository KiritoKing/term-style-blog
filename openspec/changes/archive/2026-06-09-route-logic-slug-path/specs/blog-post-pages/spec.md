## MODIFIED Requirements

### Requirement: 帖子列表页必须展示全部帖子并可进入详情
系统 MUST 在 `/posts` 页面列出全部帖子条目，并提供指向 `/posts/<path>` 的链接，其中 `path` 必须优先使用帖子 `slug`，仅当帖子没有 `slug` 时才使用 `id`。

#### Scenario: 浏览帖子列表
- **WHEN** 用户访问 `/posts`
- **THEN** 页面必须为每个帖子渲染一个条目
- **THEN** 每个条目必须包含指向 `/posts/<path>` 的可点击链接

### Requirement: 帖子详情页必须静态生成并渲染内容
系统 MUST 为每个帖子生成静态详情页，并在 `/posts/<path>` 显示标题、日期、分类、标签与正文内容，其中 `path` 必须优先使用帖子 `slug`，仅当帖子没有 `slug` 时才使用 `id`。

#### Scenario: 静态路径生成
- **WHEN** 站点执行静态构建
- **THEN** 系统必须为每个帖子生成对应的 `/posts/<path>` 路由

#### Scenario: 阅读帖子详情
- **WHEN** 用户访问任意 `/posts/<path>`
- **THEN** 页面必须显示该帖子的 `title` 与 `content`
- **THEN** 页面必须显示该帖子的 `date`、`category` 与 `tags`
