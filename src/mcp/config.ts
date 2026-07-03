import { fileURLToPath } from "node:url";

export interface McpClientConfigOptions {
  serverName?: string;
  command?: string;
  serverEntry?: string;
  workspacePaths?: string[];
  env?: Record<string, string>;
}

export interface StdioMcpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpClientConfig {
  mcpServers: Record<string, StdioMcpServerConfig>;
}

export function createStdioMcpClientConfig(options: McpClientConfigOptions = {}): McpClientConfig {
  const serverName = options.serverName ?? "ai-provider-lab";
  const command = options.command ?? process.execPath;
  const serverEntry = options.serverEntry ?? defaultServerEntry();
  const env = {
    ...options.env,
    ...(options.workspacePaths?.length ? { AI_PROVIDER_LAB_WORKSPACES: JSON.stringify(options.workspacePaths) } : {}),
  };
  return {
    mcpServers: {
      [serverName]: {
        command,
        args: [serverEntry],
        ...(Object.keys(env).length ? { env } : {}),
      },
    },
  };
}

function defaultServerEntry(): string {
  return fileURLToPath(new URL("./server.js", import.meta.url));
}
