export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
  annotations?: Record<string, unknown>;
}

const READ_ONLY = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

const CREATE_ONLY = Object.freeze({
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
});

export const MCP_TOOLS: readonly McpToolDefinition[] = [
  {
    name: "list_workspaces",
    description: "List active workspaces available to AI integrations.",
    annotations: READ_ONLY,
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "read_text_file",
    description: "Read a UTF-8 text file inside an active workspace.",
    annotations: READ_ONLY,
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative path inside the workspace." },
        workspacePath: { type: "string", description: "Optional workspace root when multiple workspaces are active." },
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "write_text_file",
    description: "Create or replace a UTF-8 text file inside an active workspace.",
    annotations: CREATE_ONLY,
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative path inside the workspace." },
        content: { type: "string", description: "Full file content." },
        workspacePath: { type: "string", description: "Optional workspace root when multiple workspaces are active." },
      },
      required: ["path", "content"],
      additionalProperties: false,
    },
  },
];

export function mcpTool(name: string): McpToolDefinition {
  const tool = MCP_TOOLS.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`Unknown MCP tool: ${name}`);
  return tool;
}
