# Manual Smoke Tests

These checks are optional and may require installed tools or API keys.

## Provider

Set `OPENAI_API_KEY`, then create a small script that uses `createProviderAdapter(providerConfigFromDefinition(providerDefinition("openai")))`.

## CLI Agent

Install one CLI, then run `detect()` for its adapter:

```ts
const adapter = createDefaultCliAgentAdapters().find((item) => item.id === "agent:codex")
console.log(await adapter?.detect())
```

## MCP

Build the repository and register the output from:

```bash
node dist/examples/mcp-config.js
```
