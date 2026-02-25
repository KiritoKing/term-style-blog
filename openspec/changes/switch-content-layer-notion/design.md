## 上下文

当前内容层通过 src/content.config.ts 中的 glob loader 读取本地 markdown 内容，文章路由与渲染依赖 getCollection('blog') 与 getEntry('blog', id)。目标是将数据源替换为 Notion 数据库，并保持 Astro Content Layer 的使用方式不变，同时保留既有的终端风格 UI 与静态渲染策略。Notion loader 已作为依赖安装，密钥与数据库 ID 将由用户稍后提供。

## 目标 / 非目标

**目标：**
- 将 content-layer 的数据源从本地文件切换为 Notion 数据库
- 保持 blog 集合的 schema 与下游页面读取方式稳定
- 添加 Notion loader 所需的基础配置与图片远程规则

**非目标：**
- 不改动页面渲染样式与布局
- 不迁移历史 markdown 内容到 Notion（由内容维护流程自行处理）
- 不引入额外客户端交互或 React 全页面渲染

## 决策

- 使用 @ntcho/notion-astro-loader 作为 loader，并将 blog 集合改为 notionLoader 配置
  - 替代方案：自定义 Notion API 拉取与本地缓存。选择原因：loader 已提供与 Astro Content Layer 的对接与图片处理能力，减少维护成本。
- 继续使用 src/content.config.ts 作为集合配置入口
  - 替代方案：迁移到 src/content/config.ts。选择原因：现有项目已使用 content.config.ts，保持一致性降低改动面。
- 环境变量仅占位，不写入真实值
  - 替代方案：在仓库内写入实际 token。选择原因：避免敏感信息泄露，保持安全最佳实践。
- 在 astro.config 中配置 .amazonaws.com 远程图片模式
  - 替代方案：不配置远程图片。选择原因：Notion file 类型图片由 AWS 资源提供，需允许构建期处理。

## 风险 / 权衡

- Notion 数据库字段与 schema 不一致 → 在 content.config.ts 中定义稳定 schema 并保持字段映射一致
- Notion file 类型图片下载或处理失败 → 配置 image.remotePatterns，必要时使用 loader 提供的图片转换工具
- 构建期依赖 Notion API 可用性 → 使用缓存与本地 imageSavePath 目录降低重复请求

## 迁移计划

- 更新 content-layer 配置为 notionLoader
- 增加 Notion 环境变量占位与图片远程规则
- 本地启动验证内容集合与页面路由生成

## 未决问题

- Notion 数据库的字段命名与实际字段类型是否与现有 schema 完全对齐
- 是否需要对 Notion 内容做字段过滤或排序策略
