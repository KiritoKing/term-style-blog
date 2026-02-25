## 上下文

当前博客内容以非统一方式渲染，页面结构与样式耦合较紧，难以在保持终端风格的同时对齐 Astro 的内容层最佳实践。Astro 5 已提供 content layer API，可在构建时生成类型安全的内容索引并保持纯静态渲染。项目样式基于 Tailwind CSS 4，需要在 Markdown 渲染中复用现有终端风格。

## 目标 / 非目标

**目标：**
- 建立基于 Astro content layer 的博客内容模型与索引
- 全量将博客内容迁移为 Markdown 文件并通过统一渲染管线输出
- 采用 Tailwind Typography 作为 Markdown 版式基础，并通过主题定制对齐现有风格

**非目标：**
- 引入全页面 React 渲染或运行时内容拉取
- 改造非博客页面的信息结构

## 决策

- 使用 Astro content layer 管理 Markdown 内容，而不是手写 frontmatter 解析。理由：构建期类型安全、统一查询 API、易于扩展字段。备选：手动读取文件与自建解析逻辑。
- 在 `src/content/` 下组织 Markdown 内容与 `config` 定义，以契合 Astro 约定。备选：将内容放在自定义目录并写自定义读取流程。
- 使用 Tailwind Typography 作为 Markdown 基础样式，并通过自定义 `prose` 变量/类名覆盖为终端风格。备选：纯手写 Markdown 样式或嵌入自定义渲染器。
- 页面渲染保持静态生成，通过内容层 API 在构建期生成列表与详情路由。备选：运行时读取内容或客户端渲染。

## 风险 / 权衡

- Markdown 迁移可能导致样式细节偏差 → 通过 `prose` 定制与现有组件样式复用缓解
- 现有内容字段不一致 → 在 content layer schema 中强制必填字段并提供迁移校验
- Tailwind Typography 默认样式与终端风格冲突 → 使用更小范围的类名覆盖与局部作用域
