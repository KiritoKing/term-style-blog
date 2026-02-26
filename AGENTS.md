# 宪法上下文

## 上下文索引
- 在进行任何代码变更/Spec变更之前，你必须先阅读`openspec/specs`里已有的相关规格文档，确认项目现状
- 当你需要更多文档时，可以访问下面的文档：
  - [Astro 官方文档](https://docs.astro.build/llms.txt)
- 若你的工具中包含了Context7 MCP或其他的文档类型MCP，也可以使用该工具进行API文档查询

## 基础规范
- 包管理使用 pnpm（以 pnpm-lock.yaml 为准）
- TypeScript 严格模式（extends astro/tsconfigs/strict）
- 禁止使用 any，类型不明确时先补齐类型定义
- 统一使用根路径别名 @（指向 src/）
- 能用 .astro 完成的页面与组件优先使用 .astro，交互再引入 React
- 样式优先 Tailwind（必要时补少量全局样式）

## Astro 开发要点
- 路由由 src/pages 的文件结构自动生成
- .astro 由脚本区（---）与模板区组成，脚本默认仅在服务端执行
- Astro 组件默认输出静态 HTML，客户端交互通过 client:* 指令按需水合
- src/layouts 是布局组件的约定目录，复用页面结构
- public 放静态资源，src 下的资源由 Astro 处理与构建
- 使用内容层时，通过 src/content.config.ts 定义内容集合与 schema
- 提交前优先跑 pnpm astro check 发现 Astro/TS 问题
