## MODIFIED Requirements

### Requirement: 帖子详情页必须静态生成并渲染内容
系统 MUST 为每个准出帖子生成静态详情页，并在 `/posts/<exact-slug>` 显示标题、日期、分类、标签、摘要与正文；slug 的大小写和非 ASCII 字符必须保持不变。

#### Scenario: 静态路径生成
- **WHEN** 站点执行静态构建
- **THEN** 系统必须为每个准出帖子生成 `/posts/<exact-slug>` 路由

#### Scenario: 阅读与继续导航
- **WHEN** 用户访问任意文章详情页
- **THEN** 页面必须显示文章元数据与正文
- **THEN** 页面必须提供返回列表与相邻文章入口

