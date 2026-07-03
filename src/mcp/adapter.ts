import { targetId } from "../core/ids.js";
import { DEFAULT_CAPABILITIES, type AiRunRequest, type AiTargetAdapter } from "../core/types.js";
import { createStdioMcpClientConfig, type McpClientConfig, type McpClientConfigOptions } from "./config.js";
import { MCP_TOOLS, type McpToolDefinition } from "./tools.js";

export interface McpTargetConfig {
  clientConfig: McpClientConfig;
  tools: readonly McpToolDefinition[];
}

export interface McpTargetAdapterOptions extends McpClientConfigOptions {
  id?: string;
  label?: string;
}

export function createMcpTargetAdapter(options: McpTargetAdapterOptions = {}): AiTargetAdapter<McpTargetConfig> {
  const id = options.id ?? "ai-provider-lab";
  const label = options.label ?? "AI Provider Lab MCP";
  return {
    id: targetId("mcp", id),
    kind: "mcp",
    label,
    shortLabel: "MCP",
    capabilities: {
      ...DEFAULT_CAPABILITIES,
      tools: true,
    },
    docs: "Workspace-neutral MCP target that exposes stdio server registration and tool schemas. It is a tool plane, not a model runtime.",
    detect: async () => ({ installed: true, status: "configured", reason: "MCP server config and tool schemas are available." }),
    buildConfig: (request?: AiRunRequest) => ({
      clientConfig: createStdioMcpClientConfig({
        ...options,
        workspacePaths: options.workspacePaths ?? workspacePathsFromRequest(request),
      }),
      tools: MCP_TOOLS,
    }),
    run: async (request, emit) => {
      emit({ kind: "init", sessionId: `mcp-${Date.now()}` });
      emit({ kind: "text_delta", text: JSON.stringify(createMcpTargetAdapter(options).buildConfig(request), null, 2) });
      emit({ kind: "done" });
    },
  };
}

export function createDefaultMcpTargetAdapters(): Array<AiTargetAdapter<McpTargetConfig>> {
  return [createMcpTargetAdapter()];
}

function workspacePathsFromRequest(request: AiRunRequest | undefined): string[] | undefined {
  if (request?.workspacePaths?.length) return request.workspacePaths;
  if (request?.workspacePath) return [request.workspacePath];
  return undefined;
}
