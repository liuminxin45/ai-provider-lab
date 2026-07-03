import { createCliAgentAdapter } from "./adapters/factory.js";
import { CLI_AGENT_DEFINITIONS } from "./adapters/definitions.js";

export * from "./adapters/definitions.js";
export * from "./adapters/factory.js";
export * from "./runtime/binary.js";
export * from "./runtime/events.js";
export * from "./runtime/process.js";
export * from "./types.js";

export function createDefaultCliAgentAdapters() {
  return CLI_AGENT_DEFINITIONS.map(createCliAgentAdapter);
}
