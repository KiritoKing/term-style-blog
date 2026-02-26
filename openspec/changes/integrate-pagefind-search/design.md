## 上下文

站点基于 Astro 静态构建，终端风格 UI 由 `src/layouts/ShellLayout.astro` 统一包裹。终端交互集中在 `src/components/react/TerminalPanel.tsx`，目前没有全文搜索能力。Pagefind 需要在静态构建产物上运行并输出 `pagefind/` 资源到构建目录。要求保持终端视觉一致、最小化客户端 JS，并将 Pagefind 固定为 devDependency 以避免重复拉取。

## 目标 / 非目标

**目标：**
- 在站点内提供终端风格的搜索入口与结果展示
- 使用 Pagefind 在构建产物 `dist/` 上生成索引与资源
- 在终端命令系统中提供搜索命令并导航到搜索页面
- 将 Pagefind 作为 devDependency 并通过脚本调用

**非目标：**
- 不实现完全自定义的搜索引擎或服务器端检索
- 不在终端面板内直接渲染完整搜索结果 UI
- 不引入全站 React 渲染或重构现有布局

## 决策

1. **使用 Pagefind 预置 UI 并通过 CSS 适配终端风格**
   - 选择理由：Pagefind 官方提供开箱即用 UI，兼容静态构建流程；通过现有全局样式覆盖可快速对齐终端风格。
   - 备选方案：自建搜索 UI 并调用 Pagefind JS API。缺点是复杂度高、需要更多客户端逻辑。

2. **新增独立搜索页面 `/search` 挂载 Pagefind UI**
   - 选择理由：保持页面结构清晰，便于通过终端命令导航，减少在终端面板内注入复杂 DOM。
   - 备选方案：在现有页面顶部注入搜索区域。缺点是结构侵入性高、与终端面板交互耦合。

3. **构建后执行索引，依赖固定为 devDependency**
   - 选择理由：Pagefind 只需在构建产物上运行，使用 devDependency 可避免每次 `npx` 远程拉取。
   - 备选方案：使用 `npx -y pagefind` 在线执行。缺点是依赖不稳定、构建时间不可控。

## 风险 / 权衡

- **本地开发无法立即看到搜索结果** → 需 `astro build` 后运行 Pagefind 索引并预览
- **预置 UI 的交互受限** → 用 CSS 优化视觉，后续如需更高定制度再评估自建 UI
- **索引文件进入构建产物** → 保持 `dist/pagefind/` 产物随构建发布，避免覆盖错误路径

