# Integrate Into Your Project

This repository is a reference kit for coding agents. When a user sends you this repo URL, do not assume you should install or run this repo. Read it, identify the required AI target kind(s), and implement the smallest matching integration inside the user's project.

## Decision Tree

- Need hosted or local model chat: use `src/providers`.
- Need Claude Code, Codex, OpenCode, Hermes, or another local coding CLI: use `src/agents`.
- Need tools exposed to agents through Model Context Protocol: use `src/mcp`.
- Need a unified selector across several backends: use `src/core`.
- Need AI configuration inside an existing product UI: use `docs/ui-integration-prompt.md`.

If the user asks for more than one kind, do not choose only one branch. Build an explicit target matrix first:

| requested capability | source directory | target kind |
| --- | --- | --- |
| Hosted API such as OpenAI, Anthropic, Gemini, OpenRouter, or custom `/chat/completions` | `src/providers` | `provider` |
| Local model endpoint such as Ollama or LM Studio | `src/providers` | `provider` |
| Local CLI agent such as Claude Code, Codex, OpenCode, or Hermes | `src/agents` | `agent` |
| MCP tools and stdio client registration | `src/mcp` | `mcp` |

Use `src/core` for a unified selector, but preserve `kind` all the way through config, UI, readiness checks, report gates, and runtime execution.

## Readiness And Gate Semantics

Do not reuse one "LLM connectivity" check for every target.

| kind | readiness check | UI label | gate should require | must not do |
| --- | --- | --- | --- | --- |
| `provider` hosted API | validate config, API key, model, and optional real request | Test connection / Detect LLM | configured endpoint and successful connection if the product requires it | imply local file or shell access |
| `provider` local model | validate Base URL and model, then optionally send a small request | Test local model | local server and model are reachable when the product requires live generation | require API key by default |
| `agent` local CLI | detect binary on PATH, version, and adapter maturity | Detect agent | installed verified CLI, or explicit template warning | send a prompt just to test readiness; call this "LLM connected" |
| `mcp` tool plane | validate server config and tool schema availability | Connect MCP / Copy config | configured tool plane | treat MCP as a model runtime |

If the target project already has `LLM_PROVIDER`, `LLM_BASE_URL`, or `testLlmConnectivity`, do not attach agent or MCP semantics to those names. Introduce a neutral `AI_TARGET_KIND` / `AI_TARGET_ID` layer or equivalent before wiring UI and gates.

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
6. Add a detect path that checks binary/version/maturity only. Do not call `run()` or send a prompt from readiness checks.
7. For Codex CLI, preserve its native stream contract: global flags before
   `exec`, `-C <workspace>` for workspace selection, stdin ignored, and JSONL
   event mapping for `thread.started`, `item.*`, and `turn.completed`.

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

When integrating multiple target kinds and dependencies are already installed, `npm run example:inspect-targets` is the fastest way to inspect this reference repo's intended `kind`, `detection`, `config`, and `docs` shape before mapping it into the target project.
