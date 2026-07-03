#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MCP_TOOLS } from "./tools.js";
import { activeWorkspaces, resolveInsideWorkspace } from "./workspaces.js";

export async function createMcpServer(): Promise<Server> {
  const server = new Server({ name: "ai-provider-lab", version: "0.1.0" }, { capabilities: { tools: {} } });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: MCP_TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;
    switch (request.params.name) {
      case "list_workspaces":
        return textContent(JSON.stringify(activeWorkspaces(), null, 2));
      case "read_text_file":
        return textContent(await readTextFile(args));
      case "write_text_file":
        return textContent(await writeTextFile(args));
      default:
        throw new Error(`Unknown MCP tool: ${request.params.name}`);
    }
  });

  return server;
}

export async function runStdioMcpServer(): Promise<void> {
  const server = await createMcpServer();
  await server.connect(new StdioServerTransport());
}

async function readTextFile(args: Record<string, unknown>): Promise<string> {
  const path = requiredString(args, "path");
  const workspacePath = optionalString(args, "workspacePath");
  const target = resolveInsideWorkspace(path, activeWorkspaces(), workspacePath);
  return readFile(target, "utf8");
}

async function writeTextFile(args: Record<string, unknown>): Promise<string> {
  const path = requiredString(args, "path");
  const content = requiredString(args, "content");
  const workspacePath = optionalString(args, "workspacePath");
  const target = resolveInsideWorkspace(path, activeWorkspaces(), workspacePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
  return JSON.stringify({ path: target });
}

function textContent(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function requiredString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing required string argument: ${key}`);
  return value;
}

function optionalString(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runStdioMcpServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
