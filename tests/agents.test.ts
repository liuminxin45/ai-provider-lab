import { chmod, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createDefaultCliAgentAdapters, findExecutable, mapJsonLineEvent, mapPlainLineEvent, stripAnsi } from "../src/agents/index.js";

describe("agents", () => {
  it("maps JSONL and line events to normalized stream events", () => {
    expect(mapJsonLineEvent(JSON.stringify({ type: "text_delta", text: "hello" }))).toEqual({ kind: "text_delta", text: "hello" });
    expect(mapJsonLineEvent(JSON.stringify({ type: "tool_start", tool_name: "read", tool_id: "1", input: { path: "a" } }))).toEqual({
      kind: "tool_start",
      toolName: "read",
      toolId: "1",
      input: { path: "a" },
    });
    expect(mapPlainLineEvent("hello\n")).toEqual({ kind: "text_delta", text: "hello\n" });
    expect(stripAnsi("\u001b[31mred\u001b[0m")).toBe("red");
  });

  it("builds permission-aware CLI configs", () => {
    const codex = createDefaultCliAgentAdapters().find((adapter) => adapter.id === "agent:codex");
    expect(codex).toBeDefined();
    expect(codex!.buildConfig({ message: "work", permissionMode: "power_user" })).toMatchObject({
      maturity: "verified",
      permissionMode: "power_user",
      binaryNames: expect.arrayContaining(["codex"]),
    });
  });

  it("marks unverified adapters as templates", async () => {
    const antigravity = createDefaultCliAgentAdapters().find((adapter) => adapter.id === "agent:antigravity");
    expect(antigravity!.buildConfig({ message: "work" })).toMatchObject({ maturity: "template" });
    await expect(antigravity!.run({ message: "work" }, () => undefined)).rejects.toThrow("adapter is a template");
  });

  it("finds executable candidates on PATH", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ai-provider-lab-"));
    const binary = join(dir, process.platform === "win32" ? "fake.cmd" : "fake");
    await writeFile(binary, process.platform === "win32" ? "@echo off\r\n" : "#!/bin/sh\n");
    await chmod(binary, 0o755);
    const found = await findExecutable([process.platform === "win32" ? "fake.cmd" : "fake"], { PATH: dir });
    expect(found).toBe(binary);
  });
});
