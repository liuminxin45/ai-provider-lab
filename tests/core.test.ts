import { describe, expect, it, vi } from "vitest";
import { AdapterRegistry, DEFAULT_CAPABILITIES, parseTargetId, targetId, type AiTargetAdapter } from "../src/core/index.js";
import { createDefaultRegistry } from "../src/index.js";

describe("core target registry", () => {
  it("formats and parses target ids", () => {
    expect(targetId("provider", " OpenAI ")).toBe("provider:openai");
    expect(parseTargetId("agent:codex")).toEqual({ kind: "agent", id: "codex" });
    expect(() => parseTargetId("bad")).toThrow("Invalid AI target id");
  });

  it("registers and dispatches adapters", async () => {
    const run = vi.fn(async () => undefined);
    const adapter: AiTargetAdapter = {
      id: "provider:test",
      kind: "provider",
      label: "Test",
      capabilities: DEFAULT_CAPABILITIES,
      docs: "test",
      detect: async () => ({ installed: true }),
      buildConfig: () => ({}),
      run,
    };
    const registry = new AdapterRegistry();
    registry.register(adapter);
    expect(registry.list()).toHaveLength(1);
    await registry.runTarget("provider:test", { message: "hello" }, vi.fn());
    expect(run).toHaveBeenCalledOnce();
  });

  it("inspects default registry targets across providers agents and mcp", async () => {
    const inspections = await createDefaultRegistry().inspectTargets({ message: "inspect", workspacePath: process.cwd() });
    expect(inspections.some((target) => target.kind === "provider")).toBe(true);
    expect(inspections.some((target) => target.kind === "agent")).toBe(true);
    expect(inspections.some((target) => target.kind === "mcp")).toBe(true);
    expect(inspections.find((target) => target.id === "agent:antigravity")?.config).toMatchObject({ maturity: "template" });
    expect(inspections.find((target) => target.id === "mcp:ai-provider-lab")?.detection).toMatchObject({ status: "configured" });
  }, 15000);
});
