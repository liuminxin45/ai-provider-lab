import { createDefaultCliAgentAdapters } from "../src/agents/index.js";

for (const adapter of createDefaultCliAgentAdapters()) {
  console.log(JSON.stringify(adapter.buildConfig({ message: "Inspect this repo", permissionMode: "safe" }), null, 2));
}
