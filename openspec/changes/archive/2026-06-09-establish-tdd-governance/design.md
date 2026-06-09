# R2: establish-tdd-governance — Design

## 系统结构

```
AGENTS.md
  └── TDD 约束节（新增）
openspec/config.yaml
  └── rules.tasks（增强）
openspec/specs/tdd-governance/spec.md
  └── 新规范文档
.agent/tasks.yaml
  └── R2 状态更新 + required_tests 字段
```

## 关键设计决策

### 1. AGENTS.md TDD 约束

在 AGENTS.md 中新增 `### TDD 约束` 节，包含：
- 测试前置原则：worker 在开始实现前必须先完成测试设计
- 测试任务必须项：每个 change 的 tasks.md 必须包含测试任务 checkbox
- 测试分层：unit/component/e2e/axe_smoke/fixture_validation 等测试类型
- 本地验证约束：不得在本地验证中使用 Notion API

### 2. tdd-governance spec

定义三个 capability：
- `tdd-governance`: 测试设计必须性、测试任务必须性、测试分层要求
- `test-fixture-source`: Markdown fixture 作为默认测试源，不得依赖真实 Notion
- `openspec-tasks-format`: tasks.md 格式规范（测试任务 checkbox 格式）

### 3. 约束执行方式

- 不依赖自动化 CI 强制（该规范是 R2 的输出，R6 才会建立 CI）
- 通过 OpenSpec validate 格式检查 + tasks.yaml 字段验证执行
- worker 自觉遵守 + supervisor 在 review 时检查

## 关键文件与职责

| 文件 | 职责 |
| --- | --- |
| `AGENTS.md` | TDD 约束写入，worker 行为规范 |
| `openspec/specs/tdd-governance/spec.md` | 测试策略、fixture 规范、tasks 格式规范 |
| `openspec/config.yaml` | tasks 规则增强 |
| `.agent/tasks.yaml` | R2 状态更新，required_tests 字段说明 |