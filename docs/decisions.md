# Decisions

## Keep Target Kinds Separate

Providers, CLI agents, and MCP are separate because they have different lifecycle, capability, and security boundaries.

## Use OpenAI-Compatible As The Provider Base

Most hosted and local providers expose `/chat/completions`. Reusing one runtime keeps new provider additions small.

## Use Thin CLI Adapters

Subprocess lifecycle behavior belongs in `src/agents/runtime`. Adapters should mostly describe binary names, args, env/config, event format, and permission semantics.

## Keep MCP Workspace-Neutral

Generated MCP client config can pass workspace paths, but the server can also infer the current working directory. This keeps registration reusable across projects.
