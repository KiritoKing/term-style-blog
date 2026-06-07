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
系统 MUST 在 `/posts` 页面列出全部帖子条目，并提供指向 `/posts/<id>` 的链接。

#### Scenario: 浏览帖子列表
- **WHEN** 用户访问 `/posts`
- **THEN** 页面必须为每个帖子渲染一个条目
- **THEN** 每个条目必须包含指向 `/posts/<id>` 的可点击链接

### Requirement: 帖子详情页必须静态生成并渲染内容
系统 MUST 为每个帖子 `id` 生成静态详情页，并在 `/posts/<id>` 显示标题、日期、分类、标签与正文内容。

#### Scenario: 静态路径生成
- **WHEN** 站点执行静态构建
- **THEN** 系统必须为每个帖子 `id` 生成对应的 `/posts/<id>` 路由

#### Scenario: 阅读帖子详情
- **WHEN** 用户访问任意 `/posts/<id>`
- **THEN** 页面必须显示该帖子的 `title` 与 `content`
- **THEN** 页面必须显示该帖子的 `date`、`category` 与 `tags`

### Requirement: 详情页必须提供返回帖子列表的入口
系统 MUST 在帖子详情页提供返回 `/posts` 的导航入口。

#### Scenario: 返回上级目录
- **WHEN** 用户在帖子详情页点击返回入口
- **THEN** 页面必须跳转至 `/posts`
