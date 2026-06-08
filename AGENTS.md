# 宪法上下文

## 上下文索引
- 在进行任何代码变更/Spec变更之前，你必须先阅读`openspec/specs`里已有的相关规格文档，确认项目现状
- 当你需要更多文档时，可以访问下面的文档：
  - [Astro 官方文档](https://docs.astro.build/llms.txt)
- 若你的工具中包含了Context7 MCP或其他的文档类型MCP，也可以使用该工具进行API文档查询

## 工作区工具约束
- 默认 coding agent 为 Codex
- 默认 skills 目录为 `.agents/skills`
- 默认规则/上下文文件为 `AGENTS.md`
- Codex skills 必须统一放在 `.agents/skills`，不得保留 `.codex/skills`
- 禁止保留 Trae 或其他 coding-agent 工具目录

## 基础规范
- 包管理使用 pnpm（以 pnpm-lock.yaml 为准）
- TypeScript 严格模式（extends astro/tsconfigs/strict）
- 禁止使用 any，类型不明确时先补齐类型定义
- 统一使用根路径别名 @（指向 src/）
- 能用 .astro 完成的页面与组件优先使用 .astro，交互再引入 React
- 样式优先 Tailwind（必要时补少量全局样式）

## Astro 开发要点
- 路由由 src/pages 的文件结构自动生成
- .astro 由脚本区（---）与模板区组成，脚本默认仅在服务端执行
- Astro 组件默认输出静态 HTML，客户端交互通过 client:* 指令按需水合
- src/layouts 是布局组件的约定目录，复用页面结构
- public 放静态资源，src 下的资源由 Astro 处理与构建
- 使用内容层时，通过 src/content.config.ts 定义内容集合与 schema
- 提交前优先跑 pnpm astro check 发现 Astro/TS 问题

## Agent 状态交接协议

### 核心原则
- 工作状态必须落在仓库文件中，不能依赖对话上下文窗口、模型记忆或单个会话的临时说明。
- 新会话恢复工作时，必须先读取本文件、`docs/ai-agent-delivery-plan.md`、`.agent/tasks.yaml`（若存在）、相关 `openspec/specs` 与相关 `openspec/changes`。
- 任何任务状态、阻塞原因、验收结果、文件锁、后续动作都必须写回 `.agent` 下的状态文件或报告文件。
- 用户手动发起 Codex 会话；agent 不默认自主创建新会话、后台调度任务或引入额外多 agent 框架。

### 状态文件约定
- `.agent/tasks.yaml` 是任务注册表，记录任务 ID、change 名称、优先级、依赖、状态、负责人会话、分支、允许编辑范围、文件锁、相关规格、测试要求、验收命令、报告路径、交接路径与更新时间。
- `.agent/handoffs/supervisor.md` 是主管会话交接快照，记录当前全局状态、ready/blocked/in review/done 任务、调度决策和下一步建议。
- `.agent/handoffs/Rxx-change-name.md` 是单任务交接快照，供新的 worker 或 reviewer 会话快速恢复任务上下文。
- `.agent/reports/Rxx-change-name.md` 是 worker 或 reviewer 的执行报告，必须保留命令、结果、风险和后续事项。
- `.agent/prompts/` 可保存 supervisor、worker、reviewer 的可复用提示词；提示词只能作为启动模板，真实状态仍以 `tasks.yaml`、handoff 和 report 为准。

### 任务状态机
- 允许状态：`blocked`、`ready`、`in_progress`、`review`、`fix_requested`、`done`、`deferred`。
- `blocked` 表示依赖未满足或存在明确阻塞；必须记录阻塞条件和解除条件。
- `ready` 表示依赖已满足且无文件锁冲突，可以由用户手动发起 worker。
- `in_progress` 表示已有 worker 会话处理；必须记录 owner、branch 和允许编辑范围。
- `review` 表示 worker 已提交报告，等待主管或 reviewer 验收。
- `fix_requested` 表示验收失败，必须记录失败命令、文件位置和修复要求。
- `done` 表示验收命令通过、报告完整、OpenSpec 状态已同步或明确无需同步。
- `deferred` 表示本轮主动延期，必须记录延期原因和重新进入条件。

### 会话恢复流程
- 任何新会话开始时先运行只读检查：读取 `AGENTS.md`、`docs/ai-agent-delivery-plan.md`、`.agent/tasks.yaml`（若存在）、`openspec list --json`、相关 OpenSpec 规格与变更、对应 handoff/report、`git status --short`。
- 若 `.agent/tasks.yaml` 不存在，主管会话应先根据 `docs/ai-agent-delivery-plan.md` 创建任务注册表，再派发 worker。
- worker 会话只能处理一个任务；开始前必须确认任务 ID、依赖状态、允许编辑范围、文件锁、相关规格、测试要求和验收命令。
- reviewer 会话不实现功能，只读取 worker report、git diff、相关规格和验收命令并输出验收结论。

### 写回要求
- 主管会话在派发、阻塞解除、验收通过、延期或调整依赖时，必须更新 `.agent/tasks.yaml` 和 `.agent/handoffs/supervisor.md`。
- worker 会话在结束前必须更新 `.agent/reports/Rxx-change-name.md` 与 `.agent/handoffs/Rxx-change-name.md`；若任务未完成，也必须写明当前进度、已改文件、失败命令、阻塞原因和下一步。
- reviewer 会话必须在对应 report 或独立 review report 中写明 `pass`、`fix_requested` 或 `blocked`，并附上具体证据。
- 任何会话在即将停止、上下文不足、遇到阻塞或交给下一会话前，都必须写一份可恢复的 handoff，不得只在聊天中说明状态。

### 交接快照模板
```md
# Handoff: Rxx change-name

Status:
Owner:
Branch:
Last updated:

Objective:
Relevant specs:
Allowed paths:
Locked/shared paths:

Completed:
In progress:
Blocked by:
Next actions:

Files changed:
Tests added/updated:
Commands run:
Command results:

Risks:
Open questions:
```

### 任务报告模板
```md
# Report: Rxx change-name

Status: done | blocked | partial | fix_requested | pass
Files changed:
Tests added/updated:
Commands run:
Result:
OpenSpec impact:
Risks:
Follow-ups:
```

### 并行与文件锁
- P0 任务默认串行；涉及 `AGENTS.md`、`openspec/config.yaml`、`src/content.config.ts`、`astro.config.mjs`、`package.json`、`pnpm-lock.yaml`、测试框架配置或内容模型的任务不得并行修改。
- 每个任务必须声明 `allowed_paths`；需要越界时先停止并在 report/handoff 中标记 blocked，由主管调整任务边界。
- 共享文件必须在 `.agent/tasks.yaml` 的 `locked_paths` 中声明；两个任务命中同一共享文件时，后发任务必须等待前一任务验收后重新读取最新状态。
- worker 不得做无关重构；发现依赖设计问题时报告 blocked，而不是扩大实现范围。

### 主管派发规则
- 主管只派发依赖已满足、状态为 `ready` 且无文件锁冲突的任务。
- 派发包必须包含：任务 ID、目标、依赖完成状态、相关 OpenSpec 文件、允许编辑范围、文件锁、必须新增/更新的测试、验收命令、报告路径和交接路径。
- 子任务完成后，主管必须基于 report、diff、OpenSpec 一致性和验收命令决定 `done`、`fix_requested`、`blocked` 或 `deferred`。
