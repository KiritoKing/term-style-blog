# R2: establish-tdd-governance — Tasks

## Test Tasks

- [ ] `AGENTS.md` 新增 `### TDD 约束` 节，写入测试前置、测试分层、本地验证约束
- [ ] `openspec/specs/tdd-governance/spec.md` 创建测试策略规范文档
- [ ] `openspec/config.yaml` rules.tasks 增强：测试任务 checkbox 必须项
- [ ] `.agent/tasks.yaml` R2 状态从 `ready` 更新为 `done`
- [ ] `openspec validate R02-establish-tdd-governance --strict` 通过
- [ ] `git diff --check` 无错误

## Implementation Tasks

- [ ] 创建 `openspec/changes/R02-establish-tdd-governance/` 目录结构
- [ ] 写入 `proposal.md`（Why/What Changes/Capabilities/Impact）
- [ ] 写入 `design.md`（系统结构、设计决策、关键文件）
- [ ] 写入 `specs/tdd-governance/spec.md`（ADDED Requirements + Scenarios）
- [ ] 写入 `tasks.md`（本文档）
- [ ] 在 `AGENTS.md` 新增 TDD 约束节
- [ ] 更新 `openspec/config.yaml` rules.tasks
- [ ] 更新 `.agent/tasks.yaml` R2 状态
- [ ] 验证格式与一致性

## Verification

- [ ] `ruby -e 'require "yaml"; YAML.load_file(".agent/tasks.yaml")'` 无解析错误
- [ ] `git diff --check` 无冲突文件
- [ ] 所有新文件格式符合 OpenSpec 规范