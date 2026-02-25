## 为什么

当前博客内容的存储与渲染方式不统一，难以在保持终端风格的同时对齐 Astro 最佳实践。现在引入 Astro content layer 与 Markdown 作为内容源，可以稳定内容结构、减少渲染复杂度，并为后续内容扩展打好基础。

## 变更内容

- 接入 Astro content layer API，统一以 Markdown 作为博客内容存储与读取方式
- 用 Tailwind Typography 作为 Markdown 的渲染样式基础，并确保与现有终端风格一致
- 调整页面与布局以适配内容层的数据模型与渲染输出

## 功能 (Capabilities)

### 新增功能
- `content-layer-markdown`: 以 Astro content layer 管理博客内容，支持 Markdown 存储与查询
- `typography-rendering`: 使用 Tailwind Typography 渲染 Markdown 内容并对齐现有视觉风格

### 修改功能
- `embed-terminal-ui-astro`: 博客内容区域改为来自 content layer 的 Markdown 数据

## 影响

- 内容数据来源与目录结构
- 博客列表与详情页面的渲染逻辑
- 布局与样式层的 Markdown 版式策略
- 构建时内容索引与类型定义
