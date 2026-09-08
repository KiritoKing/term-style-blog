# typography-rendering

## Purpose

定义 Markdown 内容的排版渲染与终端风格一致性规则，确保静态渲染的视觉呈现统一。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。
## Requirements
### Requirement: Markdown 内容渲染
系统 MUST 在构建期将 Markdown 渲染为静态 HTML，并支持稳定标题锚点、表格、图片、代码块、已发布目标的 Obsidian 双链以及 Mermaid 渐进增强，且不得启用任意 MDX 执行。

#### Scenario: 渲染真实 Obsidian 文章
- **WHEN** 准出文章包含支持的 Markdown 结构
- **THEN** 页面必须在无客户端 JavaScript 时保留可读正文
- **THEN** Mermaid 可在客户端增强为图形

### Requirement: Typography 风格对齐
系统 MUST 使用 Tailwind Typography 作为 Markdown 排版基础，并通过主题定制确保整体视觉风格与现有终端风格一致。

#### Scenario: 终端风格一致性
- **WHEN** Markdown 内容包含标题、列表、链接与代码块
- **THEN** 这些元素的排版与配色必须与现有站点风格保持一致
