# AI Agent Instructions

这是一个给 AI Agent 阅读的 AI 集成参考仓库。它不是要被整体安装到目标项目里，而是帮助你快速判断并复制最小可用模式。

## 当用户把这个 GitHub 链接发给你

如果用户给你的是 `https://github.com/liuminxin45/ai-provider-lab`，你的目标是：阅读本仓库，识别用户项目需要的 AI target 类型，并把最小实现落到用户自己的项目中。

通常不要先运行 `npm install`，也不要把整个仓库复制到用户项目。

执行顺序：

1. 先读 `docs/integrate-into-your-project.md`。
2. 再按需求选择 target：
   - 直接模型 API：读 `src/providers`。
   - 本地 CLI 编程代理：读 `src/agents`。
   - MCP 工具/注册：读 `src/mcp`。
3. 如果用户要求 API、本地模型、本地代理、MCP 中的多类能力，先读 `src/core`，建立 target 矩阵，再读所有涉及的目录。不要只选 `src/providers`。
4. 如果目标项目已有 UI，并且用户需要配置、切换、测试 AI provider / agent / MCP，再读 `docs/ui-integration-prompt.md`。
5. 在用户项目里实现最小匹配方案。
6. 使用用户项目自己的测试、构建和 lint 命令验证。

只有在你要修改这个参考仓库本身，或需要运行本仓库 tests/examples 时，才使用 `npm install`。

## Target Kind 硬规则

- `provider` 是直接模型 endpoint，可以有 `Test connection`，用于验证 API key、Base URL、模型名和本地模型服务是否可请求。
- `agent` 是本地 CLI 子进程，readiness 只能来自 binary/version/maturity 检测。不要为了检测 agent 而发送 prompt，也不要把 agent 状态叫作 LLM 连通。
- `mcp` 是工具平面，不是模型 provider，不应该进入 LLM 生成门禁。
- 如果目标项目已有 `LLM Provider` 或 `LLM Connectivity` 旧抽象，接入多 target 前必须先拆成 `AI Target` + `kind`，再分别映射 UI、检测、门禁和运行时。
- 门禁文案必须按 kind 区分：provider 可用、agent 已安装、mcp 已配置，不能统一写成 “LLM 已连通”。

## 当目标项目是带 UI 的项目时

不要无条件加 UI。先判断用户项目是否已经有 Settings / Admin / Preferences / Integrations 之类的配置界面。

- 如果目标项目没有 UI，保持无 UI 集成，只实现 provider / agent / MCP 的运行时代码。
- 如果目标项目已有 UI，且用户需要配置、切换、测试、复制配置或查看状态，把 AI 配置放进现有设置入口。
- 不要引入新的 UI 框架；优先复用目标项目已有的 Button、Input、Select、Dialog、Badge、Dropdown、Toast、Icon、Form 组件。
- UI 使用通用产品设置页范式：紧凑、产品化、低装饰、小字号、清楚状态、可测试、可复制、可删除。

可直接复制给目标项目 Agent 的 UI prompt：

```text
请先扫描当前项目已有的 UI 技术栈、设计系统、设置页和表单组件。不要做营销页，不要做大 hero，不要新增 UI 框架。若项目已有 Settings / Admin / Preferences / Integrations 页面，请在现有入口里实现一个紧凑的 AI 设置区：只展示当前项目实际接入的 provider / agent / mcp 类型；provider 使用 Test connection；agent 只做 Detect installed/ready/missing，不要发 prompt 做 LLM 检测；mcp 展示连接和配置复制；提供 checking / ready / missing / auth_missing / template 等状态；密钥默认走服务端环境变量或现有 secret 方案，不把 API key 写进前端仓库。详细范式见 docs/ui-integration-prompt.md。
```

## 修改本参考仓库时的规则

这些规则适用于你要修改 `ai-provider-lab` 本身。把模式迁移到用户项目时，优先遵守用户项目已有架构和规范。

- 不要添加 React、Tauri、Electron、Next.js 或其他 UI 框架。
- 不要把 API key 写入仓库文件；使用环境变量和 `.env.example`。
- Provider 相关代码放在 `src/providers`。
- CLI Agent 适配器放在 `src/agents/adapters`。
- 共享进程生命周期代码放在 `src/agents/runtime`。
- MCP tool schema 和注册 helper 放在 `src/mcp`。
- 新增 integration 时补一个聚焦测试和简短文档说明。

## Add A Direct Provider

1. Prefer reusing `createOpenAiCompatibleProvider` when the provider exposes `/chat/completions`.
2. Add catalog metadata in `src/providers/catalog.ts`.
3. Register the provider in `src/providers/index.ts`.
4. Add tests for base URL, API key env var, and payload shape.

## Add A CLI Agent

1. Add a thin adapter under `src/agents/adapters`.
2. Reuse `createCliAgentAdapter` and keep subprocess behavior in `src/agents/runtime`.
3. Set `maturity: "template"` until binary args, event format, and permission flags are verified.
4. Document `safe` and `power_user` mappings in the adapter `docs`.
5. Register the adapter in `src/agents/index.ts`.

### CLI Agent Subprocess Rules

These rules exist because local coding CLIs do not share argument parsing or
stdin semantics.

- Keep all process spawning in `src/agents/runtime/process.ts`.
- Always spawn CLI agents with stdin ignored/closed, for example
  `stdio: ["ignore", "pipe", "pipe"]`. Do not pipe an empty stdin handle.
- Pass prompts as explicit CLI arguments or as documented temp files. Do not
  rely on stdin unless a specific adapter is intentionally designed and tested
  for stdin input.
- For Codex CLI, put global permission/workspace flags before `exec`:
  `codex --sandbox workspace-write --ask-for-approval never -C <repo> exec --json <prompt>`.
  Do not build `codex exec --json --ask-for-approval ...`; newer Codex CLI
  versions can reject or reinterpret that shape.
- Codex `exec --json` emits real JSONL events such as `thread.started`,
  `item.started`, `item.completed`, and `turn.completed`; map
  `item.completed` with `item.type === "agent_message"` to text output instead
  of waiting for a generic `text_delta` event.
- Keep `--ask-for-approval never` paired with an explicit sandbox/workspace
  scope. Do not use dangerous bypass flags as defaults.
  This matches Tolaria's proven pattern: global Codex flags before `exec` and
  child stdin set to null/ignored.

## Add An MCP Tool

1. Add the JSON schema to `src/mcp/tools.ts`.
2. Implement the handler in `src/mcp/server.ts`.
3. Add or update config generation tests.

## 修改本参考仓库时的验证

只有在你修改这个仓库本身时，才运行：

```bash
npm run typecheck
npm test
```

## 已安装依赖时的辅助检查

如果依赖已经存在，这个命令可以检查所有 target 的 readiness/config 形状：

```bash
npm run example:inspect-targets
```
