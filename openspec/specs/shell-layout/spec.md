# shell-layout

## Purpose

定义终端壳布局的结构与路由上下文计算行为，确保页面壳一致、导航高亮一致、终端提示符一致。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 终端壳布局必须稳定装配
系统 MUST 通过 ShellLayout 装配 Sidebar、TopBar、ContentFrame 与 TerminalPanel，并在同一视觉壳内渲染页面内容 slot。

#### Scenario: 渲染任意页面
- **WHEN** 用户访问任意页面且页面使用 ShellLayout 包裹内容
- **THEN** 页面内容必须出现在 ContentFrame 区域内
- **THEN** Sidebar、TopBar 与 TerminalPanel 必须同时存在

### Requirement: 路由上下文必须由 pathname 推导
系统 MUST 基于 `Astro.url.pathname` 推导当前 route，并用于计算 prompt 与导航高亮。

#### Scenario: 首页路由归一化
- **WHEN** 用户访问 `/`
- **THEN** route 必须被归一化为 `home`
- **THEN** promptPath 必须显示为 `~`
- **THEN** TopBar 的 headerPath 必须显示为 `~`

#### Scenario: 子路由归一化
- **WHEN** 用户访问 `/posts/hello-world`
- **THEN** route 必须被归一化为 `posts/hello-world`
- **THEN** promptPath 必须显示为 `~/posts/hello-world`
- **THEN** TopBar 的 headerPath 必须显示为 `~/posts/hello-world`

### Requirement: 侧边栏激活项必须与路由区段一致
系统 MUST 将 route 映射为侧边栏激活项，并保证帖子、分类、标签的详情页仍激活对应列表入口。

#### Scenario: 帖子详情激活 posts
- **WHEN** 用户访问任意 `/posts/<id>` 页面
- **THEN** Sidebar 的 navActive 必须为 `posts`

#### Scenario: 分类详情激活 categories
- **WHEN** 用户访问任意 `/categories/<slug>` 页面
- **THEN** Sidebar 的 navActive 必须为 `categories`

#### Scenario: 标签详情激活 tags
- **WHEN** 用户访问任意 `/tags/<slug>` 页面
- **THEN** Sidebar 的 navActive 必须为 `tags`
