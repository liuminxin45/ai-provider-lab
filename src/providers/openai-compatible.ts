import { targetId } from "../core/ids.js";
import type { AiRunRequest, AiStreamEmitter } from "../core/types.js";
import { apiKeyFromEnv, providerDetection, selectedBaseUrl, selectedModelId } from "./config.js";
import type {
  ProviderAdapter,
  ProviderAdapterOptions,
  ProviderRuntime,
  ProviderTransport,
  ProviderTransportResponse,
} from "./types.js";

const defaultTransport: ProviderTransport = async (request) => {
  const response = await fetch(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(request.body),
    signal: request.signal,
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }
  return { status: response.status, body, text };
};

export function createOpenAiCompatibleProvider(options: ProviderAdapterOptions): ProviderAdapter {
  const { config } = options;
  const transport = options.transport ?? defaultTransport;
  return {
    id: targetId("provider", config.id),
    kind: "provider",
    label: config.name,
    shortLabel: config.name,
    capabilities: selectedCapabilities(config),
    docs: "OpenAI-compatible chat completions provider. Add only metadata when a provider supports /chat/completions.",
    detect: async () => providerDetection(config),
    buildConfig: () => config,
    run: async (request, emit) => runProvider(runtimeFor(config), transport, request, emit),
  };
}

export async function runProvider(
  runtime: ProviderRuntime,
  transport: ProviderTransport,
  request: AiRunRequest,
  emit: AiStreamEmitter,
): Promise<void> {
  emit({ kind: "init", sessionId: `provider-${Date.now()}` });
  const response = await transport({
    url: runtime.endpoint(),
    headers: runtime.headers(),
    body: runtime.payload(request),
    signal: request.abortSignal,
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`AI provider returned ${response.status}: ${truncate(response.text ?? JSON.stringify(response.body))}`);
  }
  emit({ kind: "text_delta", text: runtime.extractText(response) });
  emit({ kind: "done" });
}

export function runtimeFor(config: ProviderAdapterOptions["config"]): ProviderRuntime {
  return {
    endpoint: () => `${selectedBaseUrl(config)}/chat/completions`,
    headers: () => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        ...config.headers,
      };
      const apiKey = apiKeyFromEnv(config);
      if (apiKey) headers.authorization = `Bearer ${apiKey}`;
      return headers;
    },
    payload: (request) => ({
      model: selectedModelId(config),
      stream: false,
      messages: chatMessages(request),
    }),
    extractText: extractOpenAiText,
  };
}

function chatMessages(request: AiRunRequest): Array<{ role: "system" | "user"; content: string }> {
  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (request.systemPrompt?.trim()) {
    messages.push({ role: "system", content: request.systemPrompt.trim() });
  }
  messages.push({ role: "user", content: request.message });
  return messages;
}

function extractOpenAiText(response: ProviderTransportResponse): string {
  const body = response.body as { choices?: Array<{ message?: { content?: string } }> };
  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("AI provider response did not include assistant text.");
  return text;
}

function selectedCapabilities(config: ProviderAdapterOptions["config"]) {
  const model = config.models.find((candidate) => candidate.id === selectedModelId(config));
  return model?.capabilities ?? config.models[0]!.capabilities;
}

function truncate(value: string, maxLength = 600): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
