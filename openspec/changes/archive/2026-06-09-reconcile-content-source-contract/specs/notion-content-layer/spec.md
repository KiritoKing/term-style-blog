## MODIFIED Requirements

### Requirement: 使用 Notion 数据库作为内容源
系统 MUST 通过 Notion loader 从指定数据库加载生产 `blog` 集合数据，并将 Notion 作为该集合的唯一生产内容源。

#### Scenario: 构建时加载 Notion 数据
- **WHEN** 构建流程读取 content-layer 配置
- **THEN** 系统从 Notion 数据库拉取条目并生成 blog 集合

#### Scenario: 生产集合不混入 Markdown 数据
- **WHEN** 生产构建生成 `blog` 集合
- **THEN** 系统不得把本地 Markdown 文件作为生产 `blog` 集合条目加载

### Requirement: 保持集合字段结构稳定
系统 MUST 保持 `blog` 集合的页面可读字段结构稳定，包括 `id`、可选 `slug`、标题、日期、分类、标签与描述字段，并通过 Notion 属性别名归一化到现有页面读取逻辑。

#### Scenario: 页面读取集合字段
- **WHEN** 页面通过 getEntry('blog', id) 获取内容
- **THEN** 获取到的字段结构与现有渲染逻辑一致

#### Scenario: 归一化 Notion 元数据
- **WHEN** Notion 条目包含 Title/Name、Slug、Date/Published、Category、Tags 与 Description/Summary 属性
- **THEN** 系统将这些属性归一化为页面使用的 post metadata

## ADDED Requirements

### Requirement: 支持非生产内容校验兜底
系统 MUST 在非生产校验模式下允许 Notion 凭据缺失或认证失败时使用空的 `blog` 集合继续执行本地校验；生产构建不得启用该兜底。

#### Scenario: 本地校验缺少 Notion 凭据
- **WHEN** 非生产校验流程读取 `blog` 集合且 Notion 凭据缺失或认证失败
- **THEN** 系统使用空的 `blog` 集合继续校验

#### Scenario: 生产构建缺少 Notion 凭据
- **WHEN** 生产构建读取 `blog` 集合且 Notion 凭据缺失或认证失败
- **THEN** 系统必须保留 Notion loader 的失败行为
