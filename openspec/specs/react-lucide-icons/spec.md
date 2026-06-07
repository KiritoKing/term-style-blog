# react-lucide-icons

## Purpose

定义 React 渲染环境的图标组件来源与接口稳定性，保证现有组件无需调整即可继续渲染图标。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: React 图标继续使用 lucide-react
在 React 渲染环境中，系统 MUST 继续使用 lucide-react 提供图标组件，且不得替换为 Iconify 提供商。

#### Scenario: 渲染 React 图标组件
- **WHEN** React 组件请求渲染 lucide 图标
- **THEN** 系统使用 lucide-react 组件完成渲染

### Requirement: React 图标接口保持不变
在 React 组件中，图标的导入路径与调用方式 MUST 保持不变，以保证现有组件无需修改即可继续运行。

#### Scenario: 已有组件继续运行
- **WHEN** 构建或运行包含 lucide-react 图标的现有 React 组件
- **THEN** 组件无需修改即可正常渲染图标
