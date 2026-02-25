# shell-layout

## Why

系统需要一个统一的终端壳布局来承载所有页面内容，并为侧边栏高亮、顶部路径展示与底部终端提示符提供一致的路由上下文。

## What Changes

- 新增本能力的规格文档，用于冻结现有 ShellLayout 的布局装配与路由上下文计算行为

## Impact

- 相关代码：`src/layouts/ShellLayout.astro`、`src/layouts/Layout.astro`、`src/components/shell/*`、`src/components/react/TerminalPanel.tsx`

## ADDED Requirements

### 需求:终端壳布局必须稳定装配
系统必须通过 ShellLayout 装配 Sidebar、TopBar、ContentFrame 与 TerminalPanel，并在同一视觉壳内渲染页面内容 slot。

#### 场景:渲染任意页面
- **当** 用户访问任意页面且页面使用 ShellLayout 包裹内容
- **那么** 页面内容必须出现在 ContentFrame 区域内
- **那么** Sidebar、TopBar 与 TerminalPanel 必须同时存在

### 需求:路由上下文必须由 pathname 推导
系统必须基于 `Astro.url.pathname` 推导当前 route，并用于计算 prompt 与导航高亮。

#### 场景:首页路由归一化
- **当** 用户访问 `/`
- **那么** route 必须被归一化为 `home`
- **那么** promptPath 必须显示为 `~`
- **那么** TopBar 的 headerPath 必须显示为 `~`

#### 场景:子路由归一化
- **当** 用户访问 `/posts/hello-world`
- **那么** route 必须被归一化为 `posts/hello-world`
- **那么** promptPath 必须显示为 `~/posts/hello-world`
- **那么** TopBar 的 headerPath 必须显示为 `~/posts/hello-world`

### 需求:侧边栏激活项必须与路由区段一致
系统必须将 route 映射为侧边栏激活项，并保证帖子、分类、标签的详情页仍激活对应列表入口。

#### 场景:帖子详情激活 posts
- **当** 用户访问任意 `/posts/<id>` 页面
- **那么** Sidebar 的 navActive 必须为 `posts`

#### 场景:分类详情激活 categories
- **当** 用户访问任意 `/categories/<slug>` 页面
- **那么** Sidebar 的 navActive 必须为 `categories`

#### 场景:标签详情激活 tags
- **当** 用户访问任意 `/tags/<slug>` 页面
- **那么** Sidebar 的 navActive 必须为 `tags`

## MODIFIED Requirements

无

## REMOVED Requirements

无
