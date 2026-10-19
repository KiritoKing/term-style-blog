# shell-layout

## Purpose

定义终端壳布局的结构与路由上下文计算行为，确保页面壳一致、导航高亮一致、终端提示符一致。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。
## Requirements
### Requirement: 终端壳布局必须稳定装配
系统 MUST 在桌面装配 Sidebar、TopBar、ContentFrame 与 TerminalPanel，并在移动阅读宽度提供可达的折叠导航与终端控制，同时保持已有命令行为。

#### Scenario: 桌面渲染
- **WHEN** 宽屏用户访问任意页面
- **THEN** 既有终端壳区域与交互必须保留

#### Scenario: 移动端阅读
- **WHEN** 用户在 390 CSS 像素宽视口阅读文章
- **THEN** 正文必须优先显示且终端控制仍可访问

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

### Requirement: Top bar controls work without waiting for React hydration
The system MUST render theme and accessibility controls that respond through native browser event handling without requiring a React island, preserve their accessible labels and current visual states, persist preferences when storage is available, and reapply current preferences after Astro navigation.

#### Scenario: Use controls before other page islands initialize
- **WHEN** the document is parsed and the top bar controls are available
- **THEN** theme and accessibility mode changes MUST update the document immediately without waiting for React hydration
- **THEN** button labels, titles, and pressed state MUST describe the current mode

#### Scenario: Keep preferences across navigation
- **WHEN** a user changes theme or accessibility mode and navigates through Astro ClientRouter or browser history
- **THEN** the current preference MUST remain applied and controls MUST continue to respond

### Requirement: Only one responsive terminal panel is initialized
The system MUST render and initialize one TerminalPanel per page while preserving desktop visibility, the mobile disclosure control, existing commands, and behavior when the viewport changes.

#### Scenario: Switch between mobile and desktop layouts
- **WHEN** the viewport crosses the shell's responsive breakpoint
- **THEN** the same terminal instance MUST remain functional
- **THEN** desktop MUST show the panel and mobile MUST provide a usable collapsible terminal control

### Requirement: Storage failures do not block shell interactions
The system MUST treat localStorage reads and writes as best-effort and MUST keep theme/accessibility controls, terminal commands, and command-driven navigation usable when storage is denied, unavailable, corrupt, or full.

#### Scenario: Browser denies storage access
- **WHEN** localStorage access throws during a preference or terminal command action
- **THEN** the action MUST still update in-memory UI state or complete navigation
- **THEN** the page MUST NOT surface an uncaught error

#### Scenario: Stored terminal state is corrupt
- **WHEN** terminal history or output contains invalid serialized data
- **THEN** the terminal MUST start with its default state and remain usable
