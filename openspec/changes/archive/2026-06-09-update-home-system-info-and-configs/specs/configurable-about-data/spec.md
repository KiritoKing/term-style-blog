## ADDED Requirements

### Requirement: about 页面数据配置化
about 页面 MUST 从统一的配置数据读取展示内容，禁止在页面内硬编码数据列表。

#### Scenario: 读取配置数据
- **WHEN** about 页面渲染
- **THEN** 页面展示内容来自配置数据源

### Requirement: 关于页技能列表由配置驱动
about 的技能列表 MUST 完全由配置数组驱动，展示顺序与配置一致。

#### Scenario: 渲染技能列表
- **WHEN** 配置包含多个技能项
- **THEN** about 页面按配置顺序渲染技能项

### Requirement: 关于页基础信息可配置
about 页面核心描述信息 MUST 可通过配置数据进行调整。

#### Scenario: 更新描述信息
- **WHEN** 配置中的描述信息变更
- **THEN** about 页面展示最新的描述内容
