# astro-icon-provider-iconify

## Purpose

定义 Astro 渲染环境的图标提供商与图标集来源策略，确保静态构建输出的图标可用且不依赖 React 运行时。

## Requirements

### Requirement: Astro 图标渲染使用 Iconify 提供商
在 Astro 渲染环境中，系统 MUST 使用 Iconify 作为图标提供商完成图标渲染，且不得依赖 lucide-react。

#### Scenario: 渲染 Astro 图标
- **WHEN** Astro 页面或 Astro 组件请求渲染一个 lucide 图标
- **THEN** 系统通过 Iconify 提供商渲染该图标

### Requirement: Astro 图标集来源保持为 lucide
在 Astro 渲染环境中，系统 MUST 继续使用 lucide 作为图标集来源，不得替换为其他图标集。

#### Scenario: 使用 lucide 图标名称
- **WHEN** 传入的图标名称属于 lucide 图标集
- **THEN** 系统渲染与该 lucide 图标名称一致的图形

### Requirement: Astro 图标渲染结果可用于静态输出
在 Astro 静态渲染与构建输出中，图标渲染 MUST 在服务端完成，且不得要求全局客户端脚本才能显示图标。

#### Scenario: 构建后的页面展示图标
- **WHEN** 站点完成构建并以静态资源方式部署
- **THEN** 页面在未执行任何额外客户端初始化脚本的情况下仍能显示图标
