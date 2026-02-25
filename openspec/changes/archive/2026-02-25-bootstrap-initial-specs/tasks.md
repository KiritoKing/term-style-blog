## 1. 基线文档

- [x] 1.1 对照 `src/` 复核 proposal/design/specs 的覆盖范围
- [x] 1.2 复核四个 capability 的命名与目录结构一致（kebab-case）

## 2. shell-layout

- [x] 2.1 在 `/` 验证 route/promptPath/headerPath 归一化行为
- [x] 2.2 在 `/posts/<id>` 验证 navActive 映射为 posts

## 3. terminal-command-ui

- [x] 3.1 验证 `help/clear/echo/whoami/date` 命令输出符合预期
- [x] 3.2 验证 `cd/cat` 导航会在跳转前持久化输出与历史
- [x] 3.3 验证 Tab 自动补全与 ArrowUp/Down 历史回溯体验

## 4. blog-post-pages

- [x] 4.1 验证 `/posts` 列表页渲染全部帖子与链接
- [x] 4.2 验证 `/posts/<id>` 静态生成与正文渲染（含分类/标签链接）

## 5. taxonomy-browsing

- [x] 5.1 验证 `/categories` 与 `/tags` 的派生与数量展示
- [x] 5.2 验证 `/categories/<slug>` 与 `/tags/<slug>` 静态生成与过滤

## 6. 构建与检查

- [x] 6.1 运行 `pnpm astro check` 确认无类型与 Astro 检查错误
- [x] 6.2 运行 `pnpm build` 确认构建产物可生成
