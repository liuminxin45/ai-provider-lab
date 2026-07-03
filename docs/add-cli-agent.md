# Add A CLI Agent

Use this checklist when adding a local CLI coding agent.

1. Add a `CliAgentDefinition` in `src/agents/adapters/definitions.ts`, or split it into a new adapter file if the command is complex.
2. Reuse `createCliAgentAdapter`.
3. Set `maturity: "template"` first. Change to `verified` only after checking the current CLI help and event format.
4. Keep binary discovery, process spawning, stdout/stderr handling, and abort behavior in `src/agents/runtime`.
5. Document both `safe` and `power_user` semantics.
6. Add tests for args, env, permission mapping, and event parsing.

Adapter-owned behavior:

- Binary names and install URL
- CLI args
- Transient env/config
- Event format
- Permission semantics
- Maturity: `template` adapters are readable examples, but `run()` is disabled until verified.

Shared runtime-owned behavior:

- Process lifecycle
- Version probing
- Abort signal handling
- JSONL and line stream parsing
- Error normalization
