import { createDefaultRegistry } from "../src/index.js";

const registry = createDefaultRegistry();

for (const target of registry.list()) {
  console.log(`${target.id}\t${target.kind}\t${target.label}`);
}
