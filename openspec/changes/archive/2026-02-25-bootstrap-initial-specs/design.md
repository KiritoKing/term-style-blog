## 上下文

当前站点基于 Astro 5 构建，页面主体以静态渲染为主，终端交互区域由 React 组件承载。路由由 `src/pages` 提供，整体壳由 `src/layouts/ShellLayout.astro` 统一装配，基础 HTML 与全局样式在 `src/layouts/Layout.astro` 注入。内容数据目前静态维护在 `src/data/posts.ts`。

关键文件/目录职责：
- `src/pages/*`：首页、about、posts、categories、tags 的静态页面与动态路由
- `src/layouts/ShellLayout.astro`：终端壳框架（Sidebar/TopBar/ContentFrame/TerminalPanel），负责路由上下文与 prompt
- `src/components/react/TerminalPanel.tsx`：终端命令交互与导航逻辑，负责本地存储与输入体验
- `src/data/posts.ts`：帖子数据源与分类/标签衍生方法
- `src/styles/global.css`：全局主题与像素风样式

## 目标 / 非目标

**目标：**
- 用规格文档准确描述现有行为（页面结构、路由、终端交互、内容与分类标签浏览）
- 说明当前系统结构与交互流，作为后续演进的基线

**非目标：**
- 引入 CMS、后端 API 或动态数据持久层
- 调整 UI 视觉风格或重构现有样式体系
- 改变现有路由结构或页面层级

## 决策

- 采用 Astro 页面作为首要渲染层，保证大部分内容静态输出并利用构建期生成路由。
  - 替代方案：全量 React SPA。未采用原因：不符合“最小化客户端 JS”目标且破坏 Astro 优势。
- 终端交互独立为 React 组件并以 `client:load` 启动，避免全页面水合。
  - 替代方案：Astro Island 逐块脚本。未采用原因：终端需要即时键盘交互与本地状态持久化，更适合 React 组件聚合。
- 路由上下文在 ShellLayout 统一计算（基于 pathname），保证 prompt 与导航一致。
  - 替代方案：每页单独计算。未采用原因：易产生多处不一致。
- 帖子数据作为静态列表维护在 `posts.ts`，分类/标签由纯函数派生。
  - 替代方案：内容层或远端数据源。未采用原因：当前范围为静态演示站点。
- 终端历史与输出存储在 localStorage，实现跨路由保留终端状态。
  - 替代方案：内存态或 URL 状态。未采用原因：页面跳转会丢失状态。

## 风险 / 权衡

- 静态数据源 → 无法支持运行时新增内容 → 通过后续引入内容层或 CMS 解决
- localStorage 持久化 → 不同路由共享输出历史 → 可能导致上下文混杂
- 终端导航依赖 `window.location.assign` → 跳转前状态需手动持久化，若中断会丢失
- View Transitions 依赖浏览器支持 → 部分环境可能无过渡效果
