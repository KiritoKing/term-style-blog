# tdd-governance

## Overview

定义 TDD 治理规则、测试分层策略、测试 fixture 规范和 OpenSpec tasks 格式要求。

## ADDED Requirements

### Requirement: 测试设计必须先于实现

每个 OpenSpec change 在开始实现前，worker 必须先完成测试设计，写明：
- 测试类型（unit/component/e2e/axe_smoke/fixture_validation 等）
- 测试覆盖的规格点
- 使用的 fixture/source

若 change 的 tasks.md 中缺少测试任务 checkbox，视为不符合本规范。

### Requirement: 测试任务必须写入 tasks.md

每个 OpenSpec change 的 `tasks.md` 必须包含测试任务章节，使用 `- [ ]` checkbox 格式列出：
- 每个测试任务对应的规格点
- 测试类型标签
- 验收通过条件

测试任务的 checkbox 数量不得少于相关规格点的 50%。

### Requirement: 测试分层

测试必须按以下层次组织：

| 层次 | 工具 | 覆盖目标 |
| --- | --- | --- |
| unit | Vitest | 纯逻辑、分页、路由 helper、内容归一化、终端命令逻辑 |
| component | Vitest + Testing Library | Astro/React 组件渲染与交互 |
| e2e | Playwright | 核心路由、导航、表单、交互流程 |
| axe_smoke | Playwright + axe | 可访问性、基础 UI 结构 |
| fixture_validation | 自定义脚本 | Markdown fixture 完整性、env mock 有效性 |
| openspec_validation | openspec CLI | 规格文档格式与一致性 |

### Requirement: 本地验证必须使用 Markdown fixture

本地验证命令（`astro check`、`build`、`test:unit`、`test:e2e` 等）在 CI 和本地开发时必须使用 Markdown fixture source，不得：
- 连接 Notion API
- 使用真实的 `NOTION_TOKEN` 或 `NOTION_DATABASE_ID` 发起网络请求
- 在默认 CI pipeline 中包含 Notion 凭据

仅 production validation 或显式的 Notion integration 验证才可使用真实凭据。

### Requirement: 测试 fixture 源规范

测试 fixture 必须满足：
- 存放于 `src/fixtures/` 或 `tests/fixtures/` 目录
- 每个 fixture 必须有对应的 schema 验证
- fixture 数据不得依赖外部 API 响应
- fixture 应覆盖正常路径和已知边界情况

---

## ADDED Scenarios

#### Scenario: 新 change 的 tasks.md 包含测试任务

**WHEN** worker 创建新的 OpenSpec change
**THEN** 必须创建 `tasks.md` 文件，并在其中包含 `- [ ]` 格式的测试任务 checkbox
**AND** 测试任务必须覆盖相关 OpenSpec spec 中的至少 50% 的规格点
**AND** 测试任务必须标注测试类型（unit/component/e2e/axe_smoke 等）

#### Scenario: 本地验证不依赖 Notion

**WHEN** worker 在本地运行 `pnpm astro check`、`pnpm build` 或 `pnpm test:unit`
**THEN** 系统不得发起 Notion API 请求
**AND** 系统不得因缺少 Notion 凭据而报错
**AND** 系统使用 Markdown fixture 作为内容源

#### Scenario: 测试分层覆盖

**WHEN** worker 为包含 UI 组件、路由逻辑和可访问性要求的 change 设计测试
**THEN** 必须覆盖 unit/component/e2e/axe_smoke 全部四层
**AND** 每层测试必须使用对应的工具（Vitest/Playwright）
**AND** 所有测试必须在 CI 中可重复执行