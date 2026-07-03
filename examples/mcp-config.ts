import { createStdioMcpClientConfig } from "../src/mcp/index.js";

console.log(JSON.stringify(createStdioMcpClientConfig({
  workspacePaths: [process.cwd()],
}), null, 2));
