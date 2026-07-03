import type { AiStreamEvent } from "../../core/types.js";

export function mapJsonLineEvent(line: string): AiStreamEvent | null {
  const trimmed = stripAnsi(line).trim();
  if (!trimmed) return null;
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return { kind: "text_delta", text: `${trimmed}\n` };
  }

  const type = stringField(parsed, "type") ?? stringField(parsed, "kind") ?? stringField(parsed, "event");
  if (type === "init" || type === "session") {
    return { kind: "init", sessionId: stringField(parsed, "session_id") ?? stringField(parsed, "sessionId") ?? "cli-session" };
  }
  if (type === "text_delta" || type === "assistant" || type === "message") {
    return { kind: "text_delta", text: stringField(parsed, "text") ?? stringField(parsed, "content") ?? "" };
  }
  if (type === "thinking_delta" || type === "thinking") {
    return { kind: "thinking_delta", text: stringField(parsed, "text") ?? "" };
  }
  if (type === "tool_start") {
    return {
      kind: "tool_start",
      toolName: stringField(parsed, "tool_name") ?? stringField(parsed, "toolName") ?? "tool",
      toolId: stringField(parsed, "tool_id") ?? stringField(parsed, "toolId") ?? "tool",
      input: parsed.input,
    };
  }
  if (type === "tool_done") {
    return { kind: "tool_done", toolId: stringField(parsed, "tool_id") ?? stringField(parsed, "toolId") ?? "tool", output: parsed.output };
  }
  if (type === "error") {
    return { kind: "error", message: stringField(parsed, "message") ?? "CLI agent error" };
  }
  if (type === "done" || type === "complete") {
    return { kind: "done" };
  }
  return null;
}

export function mapPlainLineEvent(line: string): AiStreamEvent | null {
  const text = stripAnsi(line);
  return text.trim() ? { kind: "text_delta", text } : null;
}

export function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function stringField(value: Record<string, unknown>, key: string): string | undefined {
  const field = value[key];
  return typeof field === "string" ? field : undefined;
}
