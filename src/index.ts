import { AdapterRegistry } from "./core/registry.js";
import { createDefaultCliAgentAdapters } from "./agents/index.js";
import { createDefaultMcpTargetAdapters } from "./mcp/index.js";
import { createDefaultProviderAdapters } from "./providers/index.js";

export * from "./agents/index.js";
export * from "./core/index.js";
export * from "./mcp/index.js";
export * from "./providers/index.js";

export function createDefaultRegistry(): AdapterRegistry {
  const registry = new AdapterRegistry();
  for (const adapter of createDefaultProviderAdapters()) registry.register(adapter);
  for (const adapter of createDefaultCliAgentAdapters()) registry.register(adapter);
  for (const adapter of createDefaultMcpTargetAdapters()) registry.register(adapter);
  return registry;
}
