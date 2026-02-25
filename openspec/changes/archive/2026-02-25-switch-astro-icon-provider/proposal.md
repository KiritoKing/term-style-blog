## 为什么

当前图标实现需要在 Astro 与 React 的不同渲染环境中保持一致，但提供商混用导致配置分散且维护成本升高。统一 Astro 侧提供商为 Iconify，同时保持 React 侧继续使用 lucide-react，可降低跨框架的心智负担并保持 UI 一致性。

## 变更内容

- 在 Astro 侧将图标提供商切换为 Iconify，但图标来源仍使用 lucide 图标包
- 在 React 侧继续使用 lucide-react，不更改现有 React 图标调用方式
- 调整相关配置与使用点，保证图标渲染一致

## 功能 (Capabilities)

### 新增功能
- `astro-icon-provider-iconify`: 在 Astro 环境中使用 Iconify 作为图标提供商，同时保持 lucide 图标集

### 修改功能
- `react-lucide-icons`: React 环境继续使用 lucide-react，确保与 Astro 侧图标策略兼容

## 影响

- Astro 图标提供商配置与依赖项
- Astro 页面或组件中图标引用方式
- React 组件中与 lucide-react 的引用保持不变
