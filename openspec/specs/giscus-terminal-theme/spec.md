# giscus-terminal-theme

## Purpose

确保 giscus 评论区的视觉与站点终端 UI 一致且可维护。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 评论区视觉必须与站点终端 UI 一致
系统 MUST 为 giscus 评论区提供与站点“像素风 + 命令行 UI”一致的视觉样式，包括边框、底纹、字体、字号与强调色。

#### Scenario: 展示评论区
- **WHEN** 评论区在文章详情页渲染
- **THEN** 评论区整体必须呈现为与站点面板一致的终端模块风格

### Requirement: 主题样式必须可维护且可复用
系统 MUST 以独立样式资源的形式提供 giscus 主题，禁止将大量零散样式直接内联在页面模板中。

#### Scenario: 维护主题
- **WHEN** 需要调整评论区视觉细节
- **THEN** 修改必须集中在主题样式资源中并可被版本控制

### Requirement: 主题样式必须托管在可信来源
系统 MUST 确保 giscus 主题样式从可信域名加载，禁止引用不受控制的第三方 CSS 资源。

#### Scenario: 加载主题样式
- **WHEN** giscus 初始化并加载自定义主题
- **THEN** 主题样式必须来自站点自身构建产物或受信任的静态托管域名
