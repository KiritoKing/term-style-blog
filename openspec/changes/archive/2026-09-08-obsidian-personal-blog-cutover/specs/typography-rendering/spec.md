## MODIFIED Requirements

### Requirement: Markdown 内容渲染
系统 MUST 在构建期将 Markdown 渲染为静态 HTML，并支持稳定标题锚点、表格、图片、代码块、已发布目标的 Obsidian 双链以及 Mermaid 渐进增强，且不得启用任意 MDX 执行。

#### Scenario: 渲染真实 Obsidian 文章
- **WHEN** 准出文章包含支持的 Markdown 结构
- **THEN** 页面必须在无客户端 JavaScript 时保留可读正文
- **THEN** Mermaid 可在客户端增强为图形

