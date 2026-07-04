# UI Integration Prompt

当目标项目本身带 UI，并且用户希望配置、切换、测试或查看 AI provider / agent / MCP 状态时，按这里的范式实现。否则保持无 UI 集成。

这个 UI 范式描述的是通用产品级 AI 设置体验，只用自然语言说明，不复制任何上游项目代码：

- `AiProviderSettings`：provider 配置、已配置列表、测试连接、错误和成功反馈。
- `AiAgentsOnboardingPrompt`：checking / ready / missing 状态、检测到的 agent 列表、安装入口。
- `McpSetupDialog`：MCP 连接管理、手动配置 snippet、复制按钮、滚动代码块。
- `AiAgentsBadge`：紧凑状态入口、当前 target、警告状态、切换菜单。

UI 必须保留 target kind 语义。不要把 provider、agent、mcp 都塞进一个 `LLM 状态` 或 `Provider 连接` 文案里。

## 触发条件

只有同时满足这些条件才加 UI：

- 目标项目已经有 UI。
- 用户需要配置、切换、测试或可视化 AI 集成状态。
- 目标项目已有或可以自然承载 Settings / Admin / Preferences / Integrations 页面。

不满足时，只实现运行时代码和文档，不做设置页。

## 给目标项目 Agent 的完整 Prompt

```text
请先扫描当前项目已有 UI 技术栈、设计系统、设置页、表单组件和通知组件。不要做营销页，不要做大 hero，不要新增 UI 框架。若项目已有 Settings / Admin / Preferences / Integrations 页面，请在现有入口里实现一个紧凑产品设置区。

UI 要复用当前项目已有 Button、Input、Select、Dialog、Badge、Dropdown、Toast、Icon、Form、Card 或 Panel 组件。没有现成组件时，用项目已有 CSS/token 写最小原生结构，不引入新的设计系统。

设置区只展示当前项目实际接入的类型：
- provider：直接模型 API，例如 OpenAI、Anthropic、Gemini、OpenRouter、Ollama、LM Studio、OpenAI-compatible。
- agent：本地 CLI 编程代理，例如 Claude Code、Codex、OpenCode、Hermes。
- mcp：Model Context Protocol 工具、stdio server 和外部客户端配置。

实现状态：checking、ready、missing、auth_missing、template、error、success。提供空态、测试连接、添加、删除、复制配置、错误提示和成功提示。密钥默认使用服务端环境变量或项目已有 secret 方案，不把 API key 写进前端仓库。

检测语义必须按 target kind 区分：
- provider：可以使用 `Test connection` / `检测 LLM`，发送小请求验证 endpoint、key、model。
- local provider：可以使用 `Test local model` / `检测本地模型`，验证本地服务和模型是否可请求，不要求 API key。
- agent：只使用 `Detect agent` / `检测代理`，检查 CLI 是否安装、版本和 adapter maturity；不要发送 prompt，不要显示“LLM 已连通”。
- mcp：使用 `Connect MCP` / `复制配置` / `重连`，展示工具平面状态，不作为模型 provider。

完成后使用目标项目自己的 lint、typecheck、test、build 命令验证。
```

## 产品设置页 UI/UX 范式

整体风格：

- 这是产品设置界面，不是营销页。
- 小字号、紧凑间距、清晰标题和说明。
- 使用边框容器或轻量 panel，避免装饰性大卡片。
- 信息密度中等偏高，优先可扫读。
- 操作按钮靠近其作用区域。
- 状态文本直接、可恢复、可操作。
- 所有长内容用可滚动区域，例如 MCP JSON snippet。

Provider 设置区：

- 标题：区分本地模型和 API provider。
- 说明：解释该分组的作用和安全边界。
- 已配置列表：展示 provider 名称、模型、endpoint、key 存储状态。
- 表单字段：Provider 类型、名称、Base URL、模型 ID、API key 存储方式。
- Key 存储方式：优先环境变量或服务端 secret；如果项目支持本地保存，必须沿用项目已有安全存储。
- 操作：`Add` / `Remove` / `Test connection`。
- 状态：testing 时禁用重复提交；success 用低调成功文本；error 用就地错误文本。

Agent 状态区：

- 状态分为 checking、ready、missing。
- ready 时展示检测到的 agent、版本号、当前默认 agent。
- missing 时展示支持的 agent 列表和安装入口。
- 操作按钮命名为 `Detect agent`、`检测代理` 或等价文案，不要命名为 `检测 LLM`。
- 检测逻辑只检查 binary/version/maturity，不调用 agent `run()`，不发送 prompt。
- 产品门禁只要求 verified agent 已安装；真实执行失败应在生成/运行阶段显示为 agent 执行错误。
- 切换入口使用紧凑 dropdown，不做复杂向导。
- template adapter 要明确标注“需要验证 CLI contract 后才能启用”。

## Target UI Mapping

| target kind | main UI control | readiness label | success label | blocking copy |
| --- | --- | --- | --- | --- |
| hosted `provider` | Provider select + Base URL + model + secret/env | 检测 LLM | 已连通 | Provider 未连通或缺少 API key |
| local model `provider` | Local model select + Base URL + model | 检测本地模型 | 本地模型可用 | 本地模型不可用或模型名错误 |
| `agent` | Agent select + install/status row | 检测代理 | 已安装 / ready | 本地代理未安装或 adapter 仍为 template |
| `mcp` | Setup dialog + config snippet | 连接 MCP | 已配置 / connected | MCP 工具配置缺失 |

如果目标项目已有顶层状态卡，卡片标题也要按 kind 变化：`LLM`、`本地模型`、`AI 代理`、`MCP 工具`。不要统一显示 `LLM 已连通`。

MCP 设置区：

- 使用 Dialog 或现有设置页面内的展开 panel。
- 展示当前连接状态：checking、connected、missing、error。
- 提供连接、断开、重连按钮。
- 提供手动配置 snippet，并带复制按钮。
- snippet 使用 monospace、小字号、边框、最大高度和滚动。
- 如果支持多个客户端，可以分 Standard MCP config 和 OpenCode / 特定客户端 config。

状态入口：

- 如果项目有状态栏、顶部导航或设置入口，可以放一个紧凑 AI badge。
- Badge 展示当前 target、警告状态、可切换提示。
- 不要让 badge 承担完整设置页职责；复杂配置进入 Settings / Dialog。

## 安全与文案

- 前端不要持久化明文 API key，除非目标项目已有明确的安全存储方案。
- Hosted provider 默认提示使用环境变量或服务端 secret。
- Local provider 如 Ollama / LM Studio 可以说明无需 API key。
- Agent 的认证通常归本地 CLI 自己管理；UI 只说明 CLI 安装、PATH 和 adapter maturity，不要求用户填写 API key。
- Power-user / bypass / shell 权限必须显式说明，不默认开启危险 bypass。
- MCP config 说明要强调它是工具入口，不是模型 provider。

## 反模式

- 不要新增 landing page、hero、大插图或营销卡片。
- 不要为了 AI 集成引入新 UI 框架。
- 不要一次展示所有 provider / agent / mcp；只展示当前项目实际接入的类型。
- 不要把 agent 放进 provider 连接检测，也不要为了检测 agent 发 prompt。
- 不要把本地模型误判为必须填写 API key。
- 不要把密钥输入框做成唯一方案；环境变量和服务端 secret 应该优先。
- 不要用 toast 替代所有错误；表单错误应该就地显示。
- 不要隐藏 unavailable 状态；missing / auth_missing 要明确告诉用户下一步。
