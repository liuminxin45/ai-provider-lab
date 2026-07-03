export type AiTargetKind = "agent" | "provider" | "mcp";

export type AiPermissionMode = "safe" | "power_user";

export interface AiCapabilities {
  streaming: boolean;
  tools: boolean;
  vision: boolean;
  jsonMode: boolean;
  reasoning: boolean;
}

export const DEFAULT_CAPABILITIES: AiCapabilities = {
  streaming: false,
  tools: false,
  vision: false,
  jsonMode: false,
  reasoning: false,
};

export interface AiRunRequest {
  message: string;
  systemPrompt?: string;
  workspacePath?: string;
  workspacePaths?: string[];
  permissionMode?: AiPermissionMode;
  abortSignal?: AbortSignal;
}

export type AiStreamEvent =
  | { kind: "init"; sessionId: string }
  | { kind: "text_delta"; text: string }
  | { kind: "thinking_delta"; text: string }
  | { kind: "tool_start"; toolName: string; toolId: string; input?: unknown }
  | { kind: "tool_done"; toolId: string; output?: unknown }
  | { kind: "error"; message: string }
  | { kind: "done" };

export type AiStreamEmitter = (event: AiStreamEvent) => void;

export interface DetectionResult {
  installed: boolean;
  status?: "ready" | "configured" | "missing" | "auth_missing" | "template";
  version?: string;
  reason?: string;
}

export interface AiTargetBase {
  id: string;
  kind: AiTargetKind;
  label: string;
  shortLabel?: string;
  capabilities: AiCapabilities;
  docs: string;
}

export interface AiTargetAdapter<TConfig = unknown> extends AiTargetBase {
  detect(): Promise<DetectionResult>;
  buildConfig(request?: AiRunRequest): TConfig;
  run(request: AiRunRequest, emit: AiStreamEmitter): Promise<void>;
}

export interface AiTargetSummary {
  id: string;
  kind: AiTargetKind;
  label: string;
  shortLabel?: string;
  capabilities: AiCapabilities;
}

export interface AiTargetInspection<TConfig = unknown> extends AiTargetSummary {
  detection: DetectionResult;
  config: TConfig;
  docs: string;
}
