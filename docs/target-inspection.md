# Target Inspection

Use `registry.inspectTargets()` when an AI agent needs a complete integration map.

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
- `agent` targets with `maturity: "template"` are extension examples; their `run()` path is intentionally disabled.
- `mcp:ai-provider-lab` is available for tool schemas and stdio registration, not model inference.
