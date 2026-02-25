# Tasks
- [ ] Task 1: 设计 Astro 页面与布局拆分方案
  - [ ] SubTask 1.1: 划分页面区域为 Astro 组件与 React 组件
  - [ ] SubTask 1.2: 定义路由与布局层级结构
- [ ] Task 2: 抽取通用组件与 Hooks
  - [ ] SubTask 2.1: 拆分导航、列表、内容等可复用组件
  - [ ] SubTask 2.2: 抽取命令解析、状态与滚动等逻辑为 hooks
- [ ] Task 3: 最小化客户端激活
  - [ ] SubTask 3.1: 将静态内容迁移为 Astro 渲染
  - [ ] SubTask 3.2: 为必要交互区域使用最小 client 指令
- [ ] Task 4: 接入 view transitions 与路由优化
  - [ ] SubTask 4.1: 集成 view transitions 并适配页面切换
  - [ ] SubTask 4.2: 调整路由与布局以避免全量 React 渲染
- [ ] Task 5: 验证 UI 一致性与构建可用性
  - [ ] SubTask 5.1: 对比页面视觉一致性与交互
  - [ ] SubTask 5.2: 运行构建与基础检查

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3
- Task 5 depends on Task 4
