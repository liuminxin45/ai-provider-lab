# AI Provider Lab

一个面向 AI Agent 的轻量参考仓库：无 UI、少依赖、按类型分类，帮助 Agent 快速把常见 AI Provider / CLI Agent / MCP 集成方式落到用户自己的项目里。

## 一句话使用方式

把 [https://github.com/liuminxin45/ai-provider-lab](https://github.com/liuminxin45/ai-provider-lab) 这个 GitHub 链接拷贝给你的 Agent，它就可以按你的项目技术栈完成最常见的各种类型 AI Provider 功能集成。

推荐直接发给 Agent 的提示词：

```text
请阅读 https://github.com/liuminxin45/ai-provider-lab ，不要复制整个仓库，也不要先安装依赖。根据我的项目技术栈和需求，从 provider / agent / mcp 中选择最小模式，把对应 AI 集成实现到我的项目里，并使用我项目自己的测试和构建命令验证。
```

## 这个仓库解决什么

它把常见 AI 集成分成三类，方便 Agent 读完后快速选型：

- `provider`：直接模型 API，例如 OpenAI、Anthropic、Gemini、OpenRouter、Ollama、LM Studio、OpenAI-compatible API。
- `agent`：本地 CLI 编程代理，例如 Claude Code、Codex、OpenCode、GitHub Copilot、Gemini/Antigravity、Pi、Kiro、Hermes。
- `mcp`：Model Context Protocol 工具、stdio server 和外部客户端注册配置。

设计目标是尽可能小：只保留可复制的类型、目录、adapter 形状和安全边界；不提供 UI，不保存密钥，不要求目标项目照搬本仓库。

## 给外部 Agent 的阅读顺序

使用本仓库作为参考时不需要 `npm install`。

按这个顺序读：

1. `AGENTS.md`
2. `docs/integrate-into-your-project.md`
3. `docs/integration-taxonomy.md`
4. 只读最匹配的源码目录：
   - `src/providers`：直接模型 API
   - `src/agents`：本地 CLI 编程代理
   - `src/mcp`：MCP 工具和客户端注册
5. 如果目标项目已有 UI 且需要配置、切换或测试 AI 集成，再读 `docs/ui-integration-prompt.md`。

不要把整个仓库复制到目标项目。只复制目标项目需要的模式、类型和 adapter 形状。

## 维护本仓库时才需要安装依赖

只有在修改或验证这个参考仓库本身时，才需要：

```bash
npm install
npm run typecheck
npm test
```

示例脚本也是维护工具。它们需要依赖，是因为本仓库把 examples 做成了可类型检查、可执行的参考实现。

## 目录结构

- `src/core`: shared target, stream, permission, registry, and error types.
- `src/providers`: direct model provider definitions and runtimes.
- `src/agents`: shared CLI agent runtime plus thin per-agent adapters.
- `src/mcp`: MCP tool schemas, config generation, and a minimal stdio server.
- `examples`: runnable examples that do not require real API keys.
- `docs`: extension guides for AI agents.

CLI agent adapter 有一个 `maturity` 字段：

- `verified`：命令形状已经按本地 CLI help 校验，`run()` 可用。
- `template`：只表示集成模板；在真实 CLI contract 校验前，`run()` 会拒绝执行。

## 设计取向

本仓库只保留通用 AI 集成分层和可复制的 adapter 形状，不绑定任何上游产品、UI 框架、桌面运行时或特定业务模型：

- AI target abstraction
- Shared CLI agent runtime with thin adapters
- Direct model targets alongside coding agents
- Vault/workspace-neutral MCP registration
- Safe vs power-user permission semantics
