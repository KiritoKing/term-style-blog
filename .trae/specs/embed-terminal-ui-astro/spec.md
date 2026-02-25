# 终端风格博客嵌入 Astro Spec

## Why
需要将已有命令行风格博客页面完整迁移到 Astro 项目内，确保 UI 视觉与交互一致，并与 Astro 的项目结构对齐。

## What Changes
- 读取 ref-template 中的页面结构、样式与资源，并迁移到 Astro 的 pages/layouts/components 体系
- 将全局样式与资源引入 Astro 的入口与页面中，确保视觉一致
- 对需要客户端执行的交互逻辑使用 Astro 的客户端指令进行处理

## Impact
- Affected specs: 页面结构、样式加载、静态资源路径、客户端交互
- Affected code: src/pages/index.astro、src/layouts/Layout.astro、src/components/*、src/assets/*、src/styles/*

## ADDED Requirements
### Requirement: 终端风格博客页面在 Astro 中渲染
系统应提供与 ref-template 页面一致的终端风格博客页面，使用 Astro 页面与布局渲染输出。

#### Scenario: Success case
- **WHEN** 用户打开站点首页
- **THEN** 页面结构、排版、字体、颜色与视觉元素与 ref-template 一致

### Requirement: 样式与资源对齐
系统应导入 ref-template 的样式与资源，使 Astro 页面表现与原实现一致。

#### Scenario: Success case
- **WHEN** 页面加载完成
- **THEN** 所有背景、图标、字体与布局样式与 ref-template 一致

## MODIFIED Requirements
### Requirement: 首页渲染入口
首页应由 Astro 的 pages 目录提供，并通过 layout 统一结构与样式引入。

## REMOVED Requirements
### Requirement: 独立 Vite 应用入口
**Reason**: 页面嵌入 Astro 后不再单独作为独立 Vite 应用运行  
**Migration**: 将入口与样式迁移到 Astro 的 pages/layouts 体系中
