## MODIFIED Requirements

### Requirement: 终端壳布局必须稳定装配
系统 MUST 在桌面装配 Sidebar、TopBar、ContentFrame 与 TerminalPanel，并在移动阅读宽度提供可达的折叠导航与终端控制，同时保持已有命令行为。

#### Scenario: 桌面渲染
- **WHEN** 宽屏用户访问任意页面
- **THEN** 既有终端壳区域与交互必须保留

#### Scenario: 移动端阅读
- **WHEN** 用户在 390 CSS 像素宽视口阅读文章
- **THEN** 正文必须优先显示且终端控制仍可访问

