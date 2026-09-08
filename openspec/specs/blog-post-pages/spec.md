# blog-post-pages

## Purpose

定义帖子数据模型、列表与详情页的静态生成与渲染行为，保证终端风格浏览一致。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。
## Requirements
### Requirement: 帖子必须基于静态数据源定义
系统 MUST 在构建期从静态数据源读取帖子列表，每个帖子必须包含 `id`、`title`、`date`、`category`、`tags`、`content` 字段。

#### Scenario: 读取帖子列表
- **WHEN** 构建或渲染页面需要帖子数据
- **THEN** 系统必须以 `id` 作为唯一标识读取帖子

### Requirement: 帖子列表页必须展示全部帖子并可进入详情
系统 MUST 在 `/posts` 页面列出全部帖子条目，并提供指向 `/posts/<path>` 的链接，其中 `path` 必须优先使用帖子 `slug`，仅当帖子没有 `slug` 时才使用 `id`。

#### Scenario: 浏览帖子列表
- **WHEN** 用户访问 `/posts`
- **THEN** 页面必须为每个帖子渲染一个条目
- **THEN** 每个条目必须包含指向 `/posts/<path>` 的可点击链接

### Requirement: 帖子详情页必须静态生成并渲染内容
系统 MUST 为每个准出帖子生成静态详情页，并在 `/posts/<exact-slug>` 显示标题、日期、分类、标签、摘要与正文；slug 的大小写和非 ASCII 字符必须保持不变。

#### Scenario: 静态路径生成
- **WHEN** 站点执行静态构建
- **THEN** 系统必须为每个准出帖子生成 `/posts/<exact-slug>` 路由

#### Scenario: 阅读与继续导航
- **WHEN** 用户访问任意文章详情页
- **THEN** 页面必须显示文章元数据与正文
- **THEN** 页面必须提供返回列表与相邻文章入口

### Requirement: 详情页必须提供返回帖子列表的入口
系统 MUST 在帖子详情页提供返回 `/posts` 的导航入口。

#### Scenario: 返回上级目录
- **WHEN** 用户在帖子详情页点击返回入口
- **THEN** 页面必须跳转至 `/posts`
