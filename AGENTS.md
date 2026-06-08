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

### `/goal RXX` 端到端执行协议
- 当用户输入 `/goal RXX`、`/goal RXX <目标>` 或只给出明确需求序号时，默认目标是把该需求推进到最终可归档状态，而不是只执行当前阶段。
- agent 必须自动完成完整 OpenSpec 迭代：只读恢复检查 → 定位任务 → propose（若缺失）→ apply → 验证 → sync specs → archive → 写回 `.agent` 状态。
- 若对应 OpenSpec change 不存在，agent 必须自动创建 proposal、design、delta specs 与 tasks，并先运行 `openspec validate <change> --strict`。
- 若 change 已存在但未完成，agent 必须读取 `openspec instructions apply --change "<change>" --json`，按 pending tasks 继续实现并逐项勾选。
- 若 tasks 和验收命令全部通过，agent 必须同步 delta specs 到 `openspec/specs`，再归档到 `openspec/changes/archive/YYYY-MM-DD-<change>/`。
- 每个阶段都必须写回 `.agent/tasks.yaml`、对应 worker report、对应 handoff 和 supervisor handoff；不得只在聊天中说明进度。
- 完成后任务状态必须落到 `done`；若等待独立 reviewer，则先进入 `review`，但在用户明确要求“归档需求”或 `/goal` 端到端完成时，主管会话应基于验收证据完成归档并把状态推进到 `done`。
- agent 不应要求用户手动说出 “propose / apply / archive” 才继续；这些是 `/goal RXX` 的默认内置步骤。
- 只有以下情况才能停下来询问用户：需求序号无法从计划或注册表可靠定位、依赖或文件锁冲突无法由当前会话解除、必须越过 `allowed_paths`、验收失败且自动修复后仍无法判断正确方案、或继续会破坏仓库状态。
- 该协议不授权 agent 自主创建后台会话、后台调度任务或引入额外多 agent 框架；用户仍然手动发起 Codex 会话，agent 只在当前会话内端到端推进目标。

### 简短完成指令协议
- 当用户只说 `RXX done`、`RXX 已完成`、`RXX merged` 或类似短句时，agent 必须将其解释为“该任务的 PR 已合并，请执行合并后主管验收流程”。
- agent 必须先确认工作树状态，再执行 `git pull --ff-only`；若存在未提交改动或无法快进，必须先报告阻塞并避免覆盖用户改动。
- 拉取后必须按恢复流程读取 `AGENTS.md`、`.agent/tasks.yaml`、`.agent/handoffs/supervisor.md`、对应 task handoff/report、相关 OpenSpec specs/changes 和 `git status --short`。
- agent 必须复跑该任务 report 中列出的可重复验收命令；若命令不存在、已过期或不适用于当前状态，必须说明替代验证。
- agent 必须以 reviewer 立场检查 diff、report、handoff、OpenSpec 同步/归档状态、文件锁边界、任务状态与下一步依赖解锁情况。
- review 结果必须写入对应 report 或独立 post-merge review report，并在需要时更新 `.agent/tasks.yaml` 与 `.agent/handoffs/supervisor.md`。
- 若验收通过，agent 在最终回复中必须说明通过的命令、剩余风险和下一步应发起的任务；若验收失败，必须给出 findings、阻塞状态和修复任务。
- 用户不需要重复说明“请拉取、review、更新状态、告诉我下一步”；这些都是 `RXX done` 的默认内置步骤。

### 计划演进审视协议
- 每次 post-merge review 时，supervisor 不只验收该任务是否完成，还必须审视该变更对整体计划、依赖图、优先级、验收门禁和后续任务边界的影响。
- supervisor 必须主动寻找计划漂移信号：新发现的遗漏需求、原计划假设失效、依赖顺序需要调整、后续任务被阻塞、验收门禁不足、文件锁冲突扩大、或某项变更能明显提升整体交付质量。
- 若发现计划可能需要改进，supervisor 必须在最终回复中单独列出“计划调整建议”，说明触发原因、建议修改的文件、影响的任务、收益、风险和不调整的后果。
- 未经用户确认，supervisor 不得直接修改 `docs/ai-agent-delivery-plan.md`、`.agent/tasks.yaml` 中的任务优先级/依赖/范围，或新增、删除、重排计划任务；只能记录观察与建议。
- 用户确认计划调整后，supervisor 才能把改动写入计划文档、任务注册表、handoff/report 和必要的 OpenSpec artifacts，并重新运行相关验证。
- 如果 review 未发现需要调整计划，也必须在最终回复中明确说明“暂无计划调整建议”，避免隐性跳过该检查。

### Supervisor 回复结构
- post-merge review 或任务验收后的最终回复必须使用清晰分区，至少包含：`Review 结果`、`计划调整建议`、`下一步执行`。
- `Review 结果` 必须列出 pass/fix_requested/blocked、关键验证命令和主要 findings。
- `计划调整建议` 必须单独列出已应用的计划调整、待用户确认的计划调整，或明确写 `暂无计划调整建议`。
- `下一步执行` 必须只放推荐发起的下一项任务或阻塞解除动作，避免和 review 结论混写。

### 本地验证内容源协议
- 本地测试、类型检查、Astro check、fixture validation、CI dry run 和本地 build 验证默认必须使用 Markdown fixture source，不得连接 Notion 或依赖真实 Notion 凭据。
- 任何本地验证命令即使存在 `NOTION_TOKEN` 或 `NOTION_DATABASE_ID` 环境变量，也不得尝试读取 Notion；这些环境变量只能被显式的 production/Notion 集成验证命令使用。
- 允许读取 Notion 的命令必须在任务报告中明确标记为 production validation 或 Notion integration validation，并说明是否需要真实凭据。
- 若本地验证输出包含 Notion API 请求、`API token is invalid`、`@notionhq/client` 请求失败，默认视为本地验证策略失败，除非该命令本身就是显式 Notion 集成验证。
- R3/R5/R6 及后续测试相关任务必须优先建立和使用 Markdown fixture source，再处理生产 Notion 凭据校验。

### TDD 约束
- **测试前置原则**：每个 OpenSpec change 在开始实现前，worker 必须先完成测试设计，写明测试类型、覆盖的规格点和使用的 fixture。
- **测试任务必须性**：每个 change 的 `tasks.md` 必须包含 `- [ ]` 格式的测试任务 checkbox，数量不得少于相关规格点的 50%。
- **测试分层**：按以下层次组织测试——unit（Vitest）、component（Vitest + Testing Library）、e2e（Playwright）、axe_smoke（Playwright + axe）、fixture_validation、openspec_validation。
- **本地验证约束**：CI 和本地开发时的验证命令不得发起 Notion API 请求，不得因缺少 Notion 凭据而报错，必须使用 Markdown fixture source。
- **测试 fixture 规范**：fixture 存放于 `src/fixtures/` 或 `tests/fixtures/`，不得依赖外部 API 响应，应覆盖正常路径和已知边界情况。
- **验收命令必须性**：每个任务必须在 `tasks.yaml` 中声明 `acceptance_commands`，且命令必须在本地可复现执行。

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
