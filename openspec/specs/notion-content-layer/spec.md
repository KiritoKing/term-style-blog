# notion-content-layer

## Purpose

定义基于 Notion 数据库的内容层接入与字段兼容规则。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 使用 Notion 数据库作为内容源
系统 MUST 通过 Notion loader 从指定数据库加载内容集合数据，并在内容层中生成 blog 集合条目。

#### Scenario: 构建时加载 Notion 数据
- **WHEN** 构建流程读取 content-layer 配置
- **THEN** 系统从 Notion 数据库拉取条目并生成 blog 集合

### Requirement: 保持集合字段结构稳定
系统 MUST 保持 blog 集合的字段结构与现有页面读取逻辑兼容，包括标题、日期、分类、标签与描述字段。

#### Scenario: 页面读取集合字段
- **WHEN** 页面通过 getEntry('blog', id) 获取内容
- **THEN** 获取到的字段结构与现有渲染逻辑一致

### Requirement: 支持 Notion 文件图片的构建期处理
系统 MUST 允许 Notion file 类型图片在构建期被 Astro 处理，并将资源源站域名纳入允许列表。

#### Scenario: 构建期处理 Notion 图片
- **WHEN** Notion 内容包含 file 类型图片
- **THEN** 构建流程可从远程源拉取并处理图片资源
