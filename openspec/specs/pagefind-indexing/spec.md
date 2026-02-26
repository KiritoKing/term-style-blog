# pagefind-indexing

## Purpose

定义 Pagefind 索引在构建流程中的生成与依赖固定策略。

## Requirements

### 需求:构建产物必须包含 Pagefind 索引资源
系统必须在静态构建输出目录 `dist/` 上运行 Pagefind，并生成 `/pagefind/` 静态资源以随站点发布。

#### 场景:构建后生成索引
- **当** 站点构建完成并产出 `dist/`
- **那么** 系统必须在 `dist/` 上执行 Pagefind 索引
- **那么** `dist/pagefind/` 目录必须存在并包含索引资源

### 需求:Pagefind 必须作为开发依赖固定
系统必须将 Pagefind 以 devDependency 的方式写入项目依赖，避免构建时每次从远端拉取。

#### 场景:依赖声明
- **当** 检查 `package.json` 依赖列表
- **那么** `pagefind` 必须出现在 `devDependencies` 中
