# taxonomy-browsing

## Purpose

定义分类与标签的派生规则、列表页与详情页的静态生成与过滤行为。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 分类列表必须由帖子集合派生
系统 MUST 从帖子数据中派生分类集合，并对分类名进行小写归一化与去重。

#### Scenario: 派生分类列表
- **WHEN** 系统生成 `/categories` 页面所需数据
- **THEN** 分类集合必须由所有帖子 `category` 字段派生
- **THEN** 分类集合必须去重并小写化

### Requirement: 标签列表必须由帖子集合派生
系统 MUST 从帖子数据中派生标签集合，并对标签名进行小写归一化与去重。

#### Scenario: 派生标签列表
- **WHEN** 系统生成 `/tags` 页面所需数据
- **THEN** 标签集合必须由所有帖子 `tags` 字段派生
- **THEN** 标签集合必须去重并小写化

### Requirement: 分类与标签列表页必须展示聚合项与数量
系统 MUST 在 `/categories` 与 `/tags` 页面展示聚合项，并显示每个分类/标签对应的帖子数量。

#### Scenario: 浏览分类列表
- **WHEN** 用户访问 `/categories`
- **THEN** 页面必须列出全部分类项
- **THEN** 每个分类项必须显示该分类下的帖子数量

#### Scenario: 浏览标签列表
- **WHEN** 用户访问 `/tags`
- **THEN** 页面必须列出全部标签项
- **THEN** 每个标签项必须显示该标签下的帖子数量

### Requirement: 分类详情页必须静态生成并列出帖子
系统 MUST 为每个分类生成静态详情页，并在 `/categories/<slug>` 列出该分类下的帖子条目。

#### Scenario: 分类静态路径生成
- **WHEN** 站点执行静态构建
- **THEN** 系统必须为每个分类 slug 生成对应的 `/categories/<slug>` 路由

#### Scenario: 浏览分类详情
- **WHEN** 用户访问任意 `/categories/<slug>`
- **THEN** 页面必须仅列出 category 匹配该 slug 的帖子

### Requirement: 标签详情页必须静态生成并列出帖子
系统 MUST 为每个标签生成静态详情页，并在 `/tags/<slug>` 列出包含该标签的帖子条目。

#### Scenario: 标签静态路径生成
- **WHEN** 站点执行静态构建
- **THEN** 系统必须为每个标签 slug 生成对应的 `/tags/<slug>` 路由

#### Scenario: 浏览标签详情
- **WHEN** 用户访问任意 `/tags/<slug>`
- **THEN** 页面必须仅列出 tags 中包含该 slug 的帖子

### Requirement: 详情页必须提供返回列表页的入口
系统 MUST 在分类与标签详情页提供返回 `/categories` 或 `/tags` 的导航入口。

#### Scenario: 从分类详情返回
- **WHEN** 用户在分类详情页点击返回入口
- **THEN** 页面必须跳转至 `/categories`

#### Scenario: 从标签详情返回
- **WHEN** 用户在标签详情页点击返回入口
- **THEN** 页面必须跳转至 `/tags`
