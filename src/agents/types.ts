import type { AiPermissionMode, AiRunRequest, AiStreamEvent, AiTargetAdapter } from "../core/types.js";

export type CliEventFormat = "jsonl" | "line";
export type CliAgentMaturity = "verified" | "template";

export interface CliAgentDefinition {
  id: string;
  label: string;
  shortLabel: string;
  binaryNames: string[];
  installUrl: string;
  eventFormat: CliEventFormat;
  maturity: CliAgentMaturity;
  verificationNotes?: string;
  docs: string;
  buildArgs(request: AiRunRequest): string[];
  buildEnv?(request: AiRunRequest): Record<string, string>;
  permissionSemantics: Record<AiPermissionMode, string>;
}

export interface CliAgentConfig {
  binaryNames: string[];
  maturity: CliAgentMaturity;
  permissionMode: AiPermissionMode;
  permissionSemantics: string;
  verificationNotes?: string;
  env?: Record<string, string>;
}

export type CliAgentAdapter = AiTargetAdapter<CliAgentConfig>;

export interface CliRunOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export type CliEventMapper = (line: string) => AiStreamEvent | null;
