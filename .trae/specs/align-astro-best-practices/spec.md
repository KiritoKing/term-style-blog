# Astro 最佳实践架构调整 Spec

## Why
当前页面主要由 React 组件承载，需要调整为更符合 Astro 最佳实践的结构，同时保持 UI 完全一致。

## What Changes
- 拆分当前 React 大组件为可复用的 Astro 组件与小型 React 组件
- 抽取通用 Hooks 与纯逻辑模块，避免视图与逻辑耦合
- 使用 Astro 的路由与布局能力组织页面结构
- 引入并合理使用 view transitions
- 尽量静态化页面，最小化客户端 JS

## Impact
- Affected specs: 路由结构、布局层次、组件粒度、客户端激活策略
- Affected code: src/pages/*、src/layouts/*、src/components/*、src/hooks/*、src/styles/*

## ADDED Requirements
### Requirement: 组件与逻辑拆分
系统应提供可复用的抽象组件与 Hooks，使页面结构可组合、逻辑可复用且可测试。

#### Scenario: Success case
- **WHEN** 页面渲染与交互逻辑加载
- **THEN** 组件结构清晰分层，逻辑抽离到 hooks 或 utils

### Requirement: Astro 功能优先
系统应优先使用 Astro 的路由、布局与 view transitions，避免将页面整体渲染交给 React。

#### Scenario: Success case
- **WHEN** 用户访问首页与子视图
- **THEN** 主要结构由 Astro 输出，React 仅承载必要交互区域

### Requirement: 最小化客户端 JS
系统应尽可能静态化页面，减少客户端激活范围，确保性能与 Astro 最佳实践一致。

#### Scenario: Success case
- **WHEN** 页面首次加载
- **THEN** 仅必要区域被客户端激活，其余内容为静态输出

## MODIFIED Requirements
### Requirement: UI 完全一致
系统应在架构调整后保持页面 UI、布局与视觉效果完全一致。

#### Scenario: Success case
- **WHEN** 用户对比改造前后页面
- **THEN** 视觉与交互无差异

## REMOVED Requirements
### Requirement: 单一 React 全页面渲染
**Reason**: 不符合 Astro 最佳实践  
**Migration**: 拆分为 Astro 结构输出与必要的 React 客户端激活区域
