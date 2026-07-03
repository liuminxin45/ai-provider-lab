# Integration Taxonomy

This repository uses three target kinds.

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

## MCP

MCP is a tool protocol, not a model. The default registry exposes `mcp:ai-provider-lab` as a target so agents can discover server config and tool schemas, but it should still be treated as a tool plane rather than a model runtime.

Use this for:

- Local workspace tools
- External client registration snippets
- Tool schemas shared by agents and providers
