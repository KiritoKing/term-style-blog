## 为什么

当前 content-layer 数据源不满足将内容托管在 Notion 的目标，需要切换到 Notion 数据库以便内容管理与编辑协作。

## 变更内容

- 将 Astro Content Layer 的数据源切换为 Notion 数据库加载器
- 配置内容集合以使用 Notion loader 的加载与过滤能力
- 预留 Notion 密钥与数据库 ID 的环境变量位置

## 功能 (Capabilities)

### 新增功能
- `notion-content-layer`: 从 Notion 数据库加载内容并在内容层中可用

### 修改功能

## 影响

- content-layer 配置与内容集合定义
- 环境变量与构建配置（Notion token、database ID、远程图片规则）
- 内容渲染流程与数据来源
