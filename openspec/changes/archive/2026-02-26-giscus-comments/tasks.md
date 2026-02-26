## 1. 参考 UI 与样式规范

- [x] 1.1 梳理评论区视觉 token（字体、边框、底纹、强调色、按钮态）
- [x] 1.2 定义 giscus 主题覆盖范围与选择器策略

## 2. giscus 组件化接入

- [x] 2.1 新增 Comments 组件并封装 giscus script 注入逻辑
- [x] 2.2 在文章详情页集成 Comments，确保非文章页不加载
- [x] 2.3 配置页面与 discussion 的 pathname 映射与必要参数

## 3. 自定义主题与安全约束

- [x] 3.1 添加 giscus 终端主题 CSS 资源并接入 data-theme
- [x] 3.2 确认主题资源托管路径与缓存策略
- [x] 3.3 可选：在仓库增加 giscus.json 限制 origins/originsRegex

## 4. 验证与回归

- [x] 4.1 验证文章页评论区可加载、可跳转授权并正常发评
- [x] 4.2 验证浅色/深色模式下可读性与布局一致性
- [x] 4.3 验证无评论区页面不加载 giscus 脚本与 iframe
