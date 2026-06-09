# R2: establish-tdd-governance

## 为什么

当前仓库没有任何测试策略约束，worker 可以直接提交无测试的变更。这导致：

1. 本地验证依赖真实 Notion 凭据（`本地验证内容源协议`已在 AGENTS.md 声明但无执行约束）
2. OpenSpec change 缺少测试任务定义，无法保证可验证性
3. 后续 R3/R4/R6/R11/R19 的测试基础设施无法稳定推进

## 变更内容

- 在 `AGENTS.md` 写入明确的 TDD 约束：每个 change 必须包含测试设计
- 在 `openspec/specs/tdd-governance/spec.md` 定义测试策略与 fixture 规范
- 更新 `openspec/config.yaml` 的 tasks 规则，强制每个 change 的 tasks.md 必须包含测试任务
- 更新 `.agent/tasks.yaml` 的 R2 任务状态与 required_tests 字段

## 功能 (Capabilities)

### 新增功能

- `tdd-governance`: TDD 治理规则，强制每个 change 包含测试策略和测试任务
- `test-fixture-source`: 测试 fixture 源规范，明确本地验证必须使用 Markdown fixture 而非 Notion

### 修改功能

- `openspec-tasks-format`: OpenSpec tasks 格式规则，增加测试任务必须项
- `agent-state-registry`: 任务注册表格式，增加 required_tests 和 acceptance_commands 字段验证

## 影响

- 所有后续 OpenSpec change 的 tasks.md 必须包含测试任务
- AGENTS.md 约束 worker 在实现前必须先写测试设计
- 本地开发默认使用 Markdown fixture，不依赖 Notion 凭据
- CI/CD 配置依赖该规范建立质量门禁