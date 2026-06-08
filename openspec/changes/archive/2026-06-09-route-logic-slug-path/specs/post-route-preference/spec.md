## ADDED Requirements

### Requirement: 帖子路径必须优先使用 slug
系统在生成帖子详情路径时 MUST 优先使用帖子 `slug` 作为路径片段，只有当帖子不存在 `slug` 时才必须使用 `id`。

#### Scenario: 生成帖子详情路径
- **WHEN** 系统为某个帖子生成详情页路径
- **THEN** 若帖子存在 `slug` 必须使用 `/posts/<slug>` 作为路径
- **THEN** 若帖子不存在 `slug` 必须使用 `/posts/<id>` 作为路径
