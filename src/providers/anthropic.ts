import { targetId } from "../core/ids.js";
import type { AiRunRequest, AiStreamEmitter } from "../core/types.js";
import { apiKeyFromEnv, providerDetection, selectedBaseUrl, selectedModelId } from "./config.js";
import { runProvider } from "./openai-compatible.js";
import type { ProviderAdapter, ProviderAdapterOptions, ProviderRuntime, ProviderTransportResponse } from "./types.js";

export function createAnthropicProvider(options: ProviderAdapterOptions): ProviderAdapter {
  const { config } = options;
  return {
    id: targetId("provider", config.id),
    kind: "provider",
    label: config.name,
    shortLabel: "Anthropic",
    capabilities: config.models[0]!.capabilities,
    docs: "Anthropic Messages API provider. It uses x-api-key and anthropic-version instead of bearer auth.",
    detect: async () => providerDetection(config),
    buildConfig: () => config,
    run: async (request: AiRunRequest, emit: AiStreamEmitter) =>
      runProvider(anthropicRuntime(config), options.transport ?? defaultFetchTransport, request, emit),
  };
}

export function anthropicRuntime(config: ProviderAdapterOptions["config"]): ProviderRuntime {
  return {
    endpoint: () => `${selectedBaseUrl(config)}/messages`,
    headers: () => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        ...config.headers,
      };
      const apiKey = apiKeyFromEnv(config);
      if (apiKey) headers["x-api-key"] = apiKey;
      return headers;
    },
    payload: (request) => {
      const payload: Record<string, unknown> = {
        model: selectedModelId(config),
        max_tokens: selectedMaxOutputTokens(config),
        messages: [{ role: "user", content: request.message }],
      };
      if (request.systemPrompt?.trim()) payload.system = request.systemPrompt.trim();
      return payload;
    },
    extractText: extractAnthropicText,
  };
}

async function defaultFetchTransport(request: {
  url: string;
  headers: Record<string, string>;
  body: unknown;
  signal?: AbortSignal;
}) {
  const response = await fetch(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(request.body),
    signal: request.signal,
  });
  const text = await response.text();
  return { status: response.status, text, body: text ? JSON.parse(text) : undefined };
}

function selectedMaxOutputTokens(config: ProviderAdapterOptions["config"]): number {
  const modelId = selectedModelId(config);
  return config.models.find((model) => model.id === modelId)?.maxOutputTokens ?? 4096;
}

function extractAnthropicText(response: ProviderTransportResponse): string {
  const body = response.body as { content?: Array<{ type?: string; text?: string }> };
  const text = body.content?.map((block) => block.text ?? "").join("").trim();
  if (!text) throw new Error("Anthropic response did not include assistant text.");
  return text;
}
