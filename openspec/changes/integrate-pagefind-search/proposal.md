## 为什么

当前站点缺少全文搜索能力，用户无法在终端风格界面中快速定位内容。引入 Pagefind 能在静态构建后生成搜索索引，兼容现有 Astro 构建流程，并通过 devDependency 固化依赖避免每次从 npm 拉取。

## 变更内容

- 增加基于 Pagefind 的全文搜索入口与终端风格 UI 页面
- 在终端命令系统中加入搜索命令与导航能力
- 调整构建流程：在构建后运行 Pagefind 索引，并将 Pagefind 作为 devDependency

## 功能 (Capabilities)

### 新增功能
- `pagefind-search-ui`: 在 Astro 站点内嵌 Pagefind 搜索 UI，并适配终端风格视觉与交互
- `pagefind-indexing`: 构建后生成 Pagefind 索引与静态资源，确保部署产物包含搜索能力

### 修改功能
- `terminal-command-ui`: 增加搜索命令与导航行为

## 影响

- `package.json` 依赖与脚本（新增 devDependency 与 postbuild/索引脚本）
- `src/pages` 搜索页面与布局渲染
- `src/components/react/TerminalPanel.tsx` 命令解析与路由行为
- 全局样式与终端风格 UI 适配
