import type { AiCapabilities, AiRunRequest, AiStreamEmitter, AiTargetAdapter } from "../core/types.js";

export type ProviderKind =
  | "openai"
  | "anthropic"
  | "openai_compatible"
  | "ollama"
  | "lm_studio"
  | "openrouter"
  | "gemini";

export interface ModelDefinition {
  id: string;
  displayName?: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  capabilities: AiCapabilities;
}

export interface ProviderDefinition {
  kind: ProviderKind;
  name: string;
  baseUrl?: string;
  runtimeBaseUrl?: string;
  defaultModelId: string;
  apiKeyEnvVar?: string;
  local: boolean;
  models: ModelDefinition[];
  headers?: Record<string, string>;
}

export interface ProviderConfig extends ProviderDefinition {
  id: string;
  modelId?: string;
}

export interface ProviderTransportRequest {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  signal?: AbortSignal;
}

export interface ProviderTransportResponse {
  status: number;
  body: unknown;
  text?: string;
}

export type ProviderTransport = (request: ProviderTransportRequest) => Promise<ProviderTransportResponse>;

export interface ProviderAdapterOptions {
  config: ProviderConfig;
  transport?: ProviderTransport;
}

export interface ProviderRuntime {
  payload(request: AiRunRequest): unknown;
  endpoint(): string;
  headers(): Record<string, string>;
  extractText(response: ProviderTransportResponse): string;
}

export type ProviderAdapter = AiTargetAdapter<ProviderConfig>;

export interface ProviderChatResult {
  text: string;
}

export type ProviderEmit = AiStreamEmitter;
