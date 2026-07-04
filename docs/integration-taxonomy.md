# Integration Taxonomy

This repository uses three target kinds.

Keep this `kind` value visible in target-project code. A unified selector may share one registry, but provider, agent, and MCP targets have different readiness checks, UI labels, and gate semantics.

## Provider

A provider is a direct model endpoint. It receives messages and returns model text. It should not imply local file or shell access.

Use this for:

- OpenAI
- Anthropic
- Gemini OpenAI-compatible endpoint
- OpenRouter
- Ollama
- LM Studio
- Any custom `/chat/completions` endpoint

Readiness:

- Hosted providers need config and usually an API key.
- Local model providers such as Ollama and LM Studio do not require API keys, but the target project may send a small request to test reachability.
- It is acceptable to call this action `Test connection` or `检测 LLM`.

## Agent

An agent is a local CLI coding agent managed as a subprocess. It may have tool access, local workspace context, and provider-owned auth.

Use this for:

- Claude Code
- Codex
- OpenCode
- GitHub Copilot CLI
- Gemini/Antigravity CLI
- Pi
- Kiro
- Hermes

Readiness:

- Detect binary presence, version, and adapter maturity.
- Do not send a prompt just to test readiness.
- Do not label this state as `LLM connected`; use `agent ready`, `agent missing`, or equivalent product copy.

## MCP

MCP is a tool protocol, not a model. The default registry exposes `mcp:ai-provider-lab` as a target so agents can discover server config and tool schemas, but it should still be treated as a tool plane rather than a model runtime.

Use this for:

- Local workspace tools
- External client registration snippets
- Tool schemas shared by agents and providers

Readiness:

- Validate server config and tool schema availability.
- Do not treat MCP as a model runtime or LLM report-generation channel.
