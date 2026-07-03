import { describe, expect, it } from "vitest";
import { createMcpTargetAdapter, createStdioMcpClientConfig, mcpTool, activeWorkspaces, resolveInsideWorkspace } from "../src/mcp/index.js";

describe("mcp", () => {
  it("generates stdio client config", () => {
    expect(createStdioMcpClientConfig({
      serverName: "lab",
      command: "node",
      serverEntry: "dist/src/mcp/server.js",
      workspacePaths: ["D:/repo"],
    })).toEqual({
      mcpServers: {
        lab: {
          command: "node",
          args: ["dist/src/mcp/server.js"],
          env: { AI_PROVIDER_LAB_WORKSPACES: JSON.stringify(["D:/repo"]) },
        },
      },
    });
  });

  it("exposes MCP as a registry target config", async () => {
    const adapter = createMcpTargetAdapter({ command: "node", serverEntry: "server.js" });
    expect(adapter.id).toBe("mcp:ai-provider-lab");
    expect(await adapter.detect()).toMatchObject({ installed: true, status: "configured" });
    expect(adapter.buildConfig({ message: "config", workspacePath: "D:/repo" }).clientConfig).toEqual({
      mcpServers: {
        "ai-provider-lab": {
          command: "node",
          args: ["server.js"],
          env: { AI_PROVIDER_LAB_WORKSPACES: JSON.stringify(["D:/repo"]) },
        },
      },
    });
  });

  it("exposes expected tool schema", () => {
    expect(mcpTool("read_text_file").inputSchema.required).toEqual(["path"]);
  });

  it("resolves paths inside active workspaces only", () => {
    const workspaces = activeWorkspaces({ AI_PROVIDER_LAB_WORKSPACES: JSON.stringify([process.cwd()]) });
    expect(resolveInsideWorkspace("README.md", workspaces)).toContain("README.md");
    expect(() => resolveInsideWorkspace("../outside.txt", workspaces)).toThrow("Path escapes workspace");
  });
});
