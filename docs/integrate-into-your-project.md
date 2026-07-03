# Integrate Into Your Project

This repository is a reference kit for coding agents. When a user sends you this repo URL, do not assume you should install or run this repo. Read it, pick the right pattern, and implement the smallest matching integration inside the user's project.

## Decision Tree

- Need hosted or local model chat: use `src/providers`.
- Need Claude Code, Codex, OpenCode, Hermes, or another local coding CLI: use `src/agents`.
- Need tools exposed to agents through Model Context Protocol: use `src/mcp`.
- Need a unified selector across several backends: use `src/core`.
- Need AI configuration inside an existing product UI: use `docs/ui-integration-prompt.md`.

## Provider Integration Recipe

Use this when the target project needs OpenAI, Anthropic, Gemini, OpenRouter, Ollama, LM Studio, or an OpenAI-compatible endpoint.

1. Copy the core request/event shape from `src/core/types.ts`.
2. Copy the provider metadata idea from `src/providers/catalog.ts`.
3. Reuse the OpenAI-compatible payload shape from `src/providers/openai-compatible.ts` when the API supports `/chat/completions`.
4. Use the Anthropic runtime shape from `src/providers/anthropic.ts` only for Anthropic Messages API.
5. Read keys from environment variables. Do not write secrets into the project repository.

Minimum target-project files usually needed:

- `ai/types`
- `ai/providers/catalog`
- `ai/providers/openai-compatible`
- one registry or factory function

## CLI Agent Integration Recipe

Use this when the target project should launch a local coding agent CLI.

1. Copy the adapter interface from `src/agents/types.ts`.
2. Copy binary discovery and process streaming ideas from `src/agents/runtime`.
3. Add one thin adapter for the CLI the project actually needs.
4. Keep unverified CLIs as templates until their current help output is checked.
5. Keep permission modes explicit. Do not use dangerous bypass flags by default.

Minimum target-project files usually needed:

- `ai/agents/types`
- `ai/agents/runtime/process`
- `ai/agents/adapters/<agent>`

## MCP Integration Recipe

Use this when the target project needs tools that model clients can call.

1. Copy tool schema style from `src/mcp/tools.ts`.
2. Copy workspace containment checks from `src/mcp/workspaces.ts`.
3. Copy stdio client config generation from `src/mcp/config.ts`.
4. Implement handlers against the target project's real domain APIs.

Minimum target-project files usually needed:

- `mcp/tools`
- `mcp/server`
- `mcp/config`

## What Not To Copy

- Do not copy every provider if the target project needs only one.
- Do not copy template CLI adapters as production integrations.
- Do not copy tests unchanged unless the target project uses Vitest and TypeScript.
- Do not add UI just because this repository has target selection abstractions. If the target project already has UI and the user needs configuration, switching, testing, or MCP setup, follow `docs/ui-integration-prompt.md`.

## Validation In The Target Project

Validate with the target project's own test and build commands. This repo's `npm install`, `npm test`, and example scripts are for maintaining this reference kit, not for using it as documentation.
