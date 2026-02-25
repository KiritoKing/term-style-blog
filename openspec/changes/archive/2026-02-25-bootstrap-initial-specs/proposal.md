## 为什么

当前项目已有可运行的终端风格博客实现（Astro 页面为主、少量 React 承载交互），但缺少一套与现有代码一致的 OpenSpec 规格文档，导致后续迭代（例如新增内容源、增强终端命令、调整路由结构）缺乏可复用的行为契约与验收清单。

因此需要基于现有代码结构与实际行为，补齐第一波规格：把“现在系统做什么”明确下来，作为后续改动的稳定基线。

## 变更内容

- 新增一组面向现有功能的规格文档（specs/*），覆盖页面路由、终端壳 UI、终端命令交互、内容与分类标签浏览等核心能力
- 输出一份设计文档（design.md），描述现有系统分层、关键文件职责与交互流
- 输出一份任务清单（tasks.md），用于后续按规格逐步补齐/校验实现与测试

## 功能 (Capabilities)

### 新增功能

- `shell-layout`: 终端壳布局与路由上下文（Sidebar/TopBar/ContentFrame/TerminalPanel）一致化
- `terminal-command-ui`: 终端输入与命令交互（历史、补全、输出持久化、基于 route 的导航）
- `blog-post-pages`: 帖子内容模型与帖子列表/详情页的静态生成与渲染
- `taxonomy-browsing`: 分类与标签页的聚合与静态生成（列表页与详情页）

### 修改功能

- 无

## 影响

- 新增 OpenSpec 变更目录下的文档产出物：proposal/design/specs/tasks
- 规格的范围以当前 `src/` 下代码为准：`src/pages/*`、`src/layouts/*`、`src/components/*`、`src/data/posts.ts`、`src/styles/global.css`
