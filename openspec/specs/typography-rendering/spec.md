# typography-rendering

## Purpose

定义 Markdown 内容的排版渲染与终端风格一致性规则，确保静态渲染的视觉呈现统一。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: Markdown 内容渲染
系统 MUST 使用 Astro 的 Markdown 渲染能力输出文章内容，并保证最终 HTML 在静态构建中生成。

#### Scenario: 文章详情页渲染
- **WHEN** 用户访问某篇文章详情页
- **THEN** 页面必须渲染该文章的 Markdown 内容且不依赖客户端 JS

### Requirement: Typography 风格对齐
系统 MUST 使用 Tailwind Typography 作为 Markdown 排版基础，并通过主题定制确保整体视觉风格与现有终端风格一致。

#### Scenario: 终端风格一致性
- **WHEN** Markdown 内容包含标题、列表、链接与代码块
- **THEN** 这些元素的排版与配色必须与现有站点风格保持一致
