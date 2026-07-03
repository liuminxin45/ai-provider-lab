# Add An MCP Tool

Use this checklist when adding a Model Context Protocol tool.

1. Add the schema to `src/mcp/tools.ts`.
2. Implement the handler in `src/mcp/server.ts`.
3. Keep workspace path validation in `src/mcp/workspaces.ts`.
4. Add tests for schema shape and handler behavior.
5. Update examples only when the new tool changes registration or setup.

MCP tools should be workspace-neutral. Avoid hardcoding a single project path into durable client config.
