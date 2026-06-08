# configurable-network-links

## Purpose

定义侧栏 network 链接的配置化数据模型与渲染规则，保证链接地址、展示文案、图标名称和空状态行为都由统一配置驱动，并保持侧栏终端风格展示稳定。

## Requirements

### Requirement: 侧栏 network 使用配置数组驱动
侧栏 network MUST 从配置数组渲染，每一项包含图标、文案与链接信息。

#### Scenario: 渲染配置数组
- **WHEN** 配置数组包含多项 network 配置
- **THEN** 侧栏按配置顺序渲染对应的图标、文案与链接

### Requirement: network 链接可点击跳转
每一条 network 配置 MUST 渲染为可点击的链接，并使用配置的跳转地址。

#### Scenario: 点击跳转
- **WHEN** 用户点击 network 项
- **THEN** 访问配置中指定的链接

### Requirement: 空配置不显示内容
系统 MUST 当 network 配置数组为空时，侧栏不得展示空白列表内容。

#### Scenario: 无配置项
- **WHEN** network 配置数组为空
- **THEN** 侧栏不显示任何 network 列表项
