# post-route-preference

## Purpose

定义帖子详情路径生成时的 slug/id 优先级，保证列表链接、静态路径生成和后续迁移重定向都能引用同一套稳定规则，避免同一文章在不同入口产生不一致的 URL。

## Requirements

### Requirement: 帖子路径必须优先使用 slug
系统在生成帖子详情路径时 MUST 优先使用帖子 `slug` 作为路径片段，只有当帖子不存在 `slug` 时才必须使用 `id`。

#### Scenario: 生成帖子详情路径
- **WHEN** 系统为某个帖子生成详情页路径
- **THEN** 若帖子存在 `slug` 必须使用 `/posts/<slug>` 作为路径
- **THEN** 若帖子不存在 `slug` 必须使用 `/posts/<id>` 作为路径
