# terminal-command-ui

## Purpose

定义终端命令面板的输入输出、交互与路由联动行为，确保跨页面体验一致。 用于指导后续变更、校验实现行为，并保持与现有终端风格博客约束一致。

## Requirements

### Requirement: 终端必须提供命令输入与输出区
系统 MUST 在页面底部渲染终端输出区与输入框，并展示提示符 `guest@server:{promptPath} $`。

#### Scenario: 终端基础显示
- **WHEN** 页面加载完成
- **THEN** 终端输出区必须显示至少一条提示信息
- **THEN** 输入框必须可聚焦并接受键盘输入

### Requirement: 终端必须支持命令历史回溯
系统 MUST 保存已执行命令并支持通过方向键回溯历史输入。

#### Scenario: 向上回溯历史
- **WHEN** 用户已执行至少一条命令
- **AND** 用户按下 ArrowUp
- **THEN** 输入框必须显示最近一次执行的命令

#### Scenario: 向下退出历史
- **WHEN** 用户处于历史回溯状态
- **AND** 用户按下 ArrowDown 直至到达末尾
- **THEN** 输入框必须恢复为空

### Requirement: 终端必须支持命令自动补全
系统 MUST 在用户按下 Tab 时根据当前输入执行命令补全或输出候选。

#### Scenario: 唯一命令补全
- **WHEN** 用户输入 `he` 并按下 Tab
- **THEN** 输入框必须自动补全为 `help `

#### Scenario: 多候选输出
- **WHEN** 用户输入 `c` 并按下 Tab
- **THEN** 终端输出必须显示所有匹配的命令列表

### Requirement: 终端输出必须在页面跳转前持久化
系统 MUST 在发生路由跳转前将终端输出与历史记录写入本地存储。

#### Scenario: 执行导航命令
- **WHEN** 用户执行 `cd posts`
- **THEN** 系统必须在跳转前持久化终端输出与历史

### Requirement: 终端命令必须与路由导航联动
系统 MUST 根据输入命令在必要时触发页面跳转，并在输出区回显执行结果或错误信息。

#### Scenario: 进入 posts 列表
- **WHEN** 用户在任意页面输入 `cd posts`
- **THEN** 终端输出必须包含目录切换提示
- **THEN** 页面必须跳转至 `/posts`

#### Scenario: 读取帖子文件
- **WHEN** 用户在 posts 列表页输入 `cat <post-id>.md`
- **THEN** 终端输出必须包含读取提示
- **THEN** 页面必须跳转至 `/posts/<post-id>`

#### Scenario: 未知命令报错
- **WHEN** 用户输入未支持的命令
- **THEN** 终端输出必须以错误样式显示 `command not found` 信息

### Requirement: 终端必须支持基础内建命令集合
系统 MUST 至少支持以下命令：`ls`、`dir`、`cd`、`pwd`、`cat`、`clear`、`echo`、`whoami`、`date`、`help`、`grep`。

#### Scenario: 清屏
- **WHEN** 用户输入 `clear`
- **THEN** 终端输出必须被清空

#### Scenario: 帮助信息
- **WHEN** 用户输入 `help`
- **THEN** 终端输出必须列出可用命令及简要说明

#### Scenario: 执行 grep 命令
- **WHEN** 用户输入 `grep <query>`
- **THEN** 终端输出必须提示正在执行 grep 搜索
- **THEN** 页面必须跳转至 `/search?q=<query>`

#### Scenario: grep 缺少参数
- **WHEN** 用户输入 `grep` 且未提供查询内容
- **THEN** 终端输出必须提示正确用法
