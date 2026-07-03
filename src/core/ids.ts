import type { AiTargetKind } from "./types.js";

export function targetId(kind: AiTargetKind, id: string): string {
  const normalized = id.trim().toLowerCase();
  if (!normalized) throw new Error("Target id cannot be empty.");
  return `${kind}:${normalized}`;
}

export function parseTargetId(value: string): { kind: AiTargetKind; id: string } {
  const [kind, ...rest] = value.split(":");
  const id = rest.join(":").trim();
  if (!isAiTargetKind(kind) || !id) {
    throw new Error(`Invalid AI target id: ${value}`);
  }
  return { kind, id };
}

function isAiTargetKind(value: string | undefined): value is AiTargetKind {
  return value === "agent" || value === "provider" || value === "mcp";
}
