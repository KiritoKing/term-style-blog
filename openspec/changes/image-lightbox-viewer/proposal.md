## Why

正文图片受文章栏宽度限制，读者无法就地查看大图。用户要求保持终端视觉、HTML/CSS 优先，并在隔离公开演示预览中验收。

## What Changes

- 为未链接的正文图片渐进增强原生模态查看器，支持按钮、Escape、遮罩关闭和焦点恢复。
- 保留图片链接、alt/title、原图懒加载以及无 JavaScript 正文。
- 覆盖 Astro 导航、重复初始化、深浅主题和移动视口。
- 支持按钮/滚轮缩放、鼠标与触屏拖拽、双指缩放、重置适配视图，按需加载维护活跃的轻量 Panzoom。
- 独立的分支预览 Actions 仅部署仓库演示内容，绑定完整 SHA、noindex 和既有 Access 保护。

## Capabilities

### New Capabilities
- `image-lightbox-viewer`: Baseline 原生正文图片查看、可访问性和渐进增强。

### Modified Capabilities
- `ci-workflow-roles`: 增加显式授权功能分支的公开演示预览，保留普通 PR CI 与生产发布职责。

## Impact

文章模板、Astro 组件、客户端脚本、CSS、公开演示 Markdown/图片、Playwright 和分支预览 workflow。运行时依赖仅 `@panzoom/panzoom` 4.6.2（MIT，无传递依赖，2026-04-02 发布），首次打开按需加载，无 React island。封面不在用户本次正文需求范围；不读取私有内容，不改生产 workflow，不合并。

## Test Impact

先写 Playwright 回归并记录失败，再实现。公开演示覆盖 Astro 根路径图片、内嵌 data 图片、已有图片链接、标题与空 alt；E2E 检查键盘/焦点/模态、移动几何、两主题、重复操作、Astro 导航与无 JS。axe smoke 检查打开的 dialog。部署策略 Node 测试验证无私有内容和不可生产上传。
