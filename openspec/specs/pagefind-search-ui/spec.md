# pagefind-search-ui

## Purpose

提供基于 Pagefind 的 grep 风格搜索页面与终端一致的视觉输出。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 站点必须提供基于 grep 交互的搜索页面
系统 MUST 在 `/search` 页面提供 grep 风格的搜索交互，并使用 Pagefind 作为底层索引与查询实现。

#### Scenario: 访问搜索页面
- **WHEN** 用户访问 `/search`
- **THEN** 页面必须渲染 grep 风格的搜索输入与结果区域
- **THEN** 页面必须以 Pagefind 索引作为数据来源

### Requirement: 搜索结果必须体现 grep 风格的路径与片段
系统 MUST 在结果中清晰展示文件路径与内容片段，可使用卡片或分行布局承载。

#### Scenario: 展示 grep 输出
- **WHEN** 搜索命中结果
- **THEN** 每条结果必须包含文件路径与内容片段
- **THEN** 搜索页面必须显示执行命令头信息（例如 `$ grep -n "<query>" ~/posts/*.md`）

### Requirement: 搜索界面必须适配终端风格视觉
系统 MUST 确保搜索页面使用终端字体与现有终端主题色彩，使搜索输入区与结果列表与终端 UI 风格一致。

#### Scenario: 终端风格一致性
- **WHEN** 搜索页面渲染完成
- **THEN** 搜索输入区与结果列表必须使用终端字体样式
- **THEN** 搜索页面的前景与背景颜色必须与终端主题保持一致
