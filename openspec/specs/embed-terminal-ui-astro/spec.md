# embed-terminal-ui-astro

## Purpose

定义终端风格页面在 Astro 文章列表与详情页中的数据来源与渲染要求。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 文章页面使用内容层数据
系统 MUST 使用 Astro content layer 查询结果驱动文章列表与详情页的渲染，而不是依赖手写的运行时数据源。

#### Scenario: 列表页数据来源替换
- **WHEN** 访问文章列表页
- **THEN** 页面必须使用内容层返回的文章集合渲染列表

#### Scenario: 详情页数据来源替换
- **WHEN** 访问文章详情页
- **THEN** 页面必须使用内容层返回的单篇文章数据渲染正文与元信息
