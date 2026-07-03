import { createDefaultRegistry } from "../src/index.js";

const registry = createDefaultRegistry();
const inspections = await registry.inspectTargets({
  message: "Inspect available AI integration targets.",
  workspacePath: process.cwd(),
  permissionMode: "safe",
});

console.log(JSON.stringify(inspections, null, 2));
