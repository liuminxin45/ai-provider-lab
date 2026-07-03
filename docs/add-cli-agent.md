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

Non-interactive subprocess rules:

- Spawn agent CLIs with stdin ignored or closed. In Node, use
  `stdio: ["ignore", "pipe", "pipe"]`.
- Do not pipe an empty stdin to Codex or similar CLIs. Some versions treat a
  piped stdin handle as extra user input even when a prompt argument exists.
- Adapter prompts should be explicit CLI arguments or documented temp files.
  Stdin-based adapters must be tested separately.
- Codex CLI global flags belong before `exec`:
  `codex --sandbox workspace-write --ask-for-approval never --cd <repo> exec --json <prompt>`.
  Keep `--json` after `exec`.
  This mirrors Tolaria's subprocess pattern and avoids Codex reinterpreting
  approval/sandbox flags or trying to read additional stdin.
