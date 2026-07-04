# Target Inspection

Use `registry.inspectTargets()` when an AI agent needs a complete integration map.

Run this before implementing a target project's unified selector, settings UI, or gate logic across more than one target kind. It is the quickest way to avoid treating CLI agents or MCP tools as model providers.

It returns:

- target id, kind, label, and capabilities
- `detect()` output such as `ready`, `configured`, `missing`, `auth_missing`, or `template`
- adapter config generated for the current request
- adapter docs

Recommended first command:

```bash
npm run example:inspect-targets
```

Interpretation:

- `provider` targets with `auth_missing` need an environment variable before real calls.
- local `provider` targets such as Ollama and LM Studio can be `configured` without an API key; live reachability is checked only when the target project sends a request.
- `agent` targets with `ready` are installed verified CLI adapters. A readiness check should inspect binary/version/maturity only and must not send a prompt.
- `agent` targets with `maturity: "template"` are extension examples; their `run()` path is intentionally disabled.
- `mcp:ai-provider-lab` is available for tool schemas and stdio registration, not model inference.

Suggested mapping:

| kind | detection status | target-project UI | target-project gate |
| --- | --- | --- | --- |
| `provider` | `configured` / `auth_missing` | Provider settings and test connection | model endpoint is configured and, if required, connection test passes |
| `agent` | `ready` / `missing` / `template` | Agent install/status detection | verified CLI is installed; template adapters require explicit user acknowledgement |
| `mcp` | `configured` / `missing` | MCP config dialog and copyable client snippet | tool plane is configured, not a model runtime |
