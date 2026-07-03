import { DEFAULT_CAPABILITIES } from "../core/types.js";
import type { ProviderDefinition } from "./types.js";

const CHAT_WITH_STREAMING = {
  ...DEFAULT_CAPABILITIES,
  streaming: true,
};

const CHAT_WITH_TOOLS = {
  ...CHAT_WITH_STREAMING,
  tools: true,
  jsonMode: true,
};

export const PROVIDER_CATALOG: readonly ProviderDefinition[] = [
  {
    kind: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    runtimeBaseUrl: "https://api.openai.com/v1",
    defaultModelId: "gpt-4.1-mini",
    apiKeyEnvVar: "OPENAI_API_KEY",
    local: false,
    models: [{ id: "gpt-4.1-mini", capabilities: CHAT_WITH_TOOLS }],
  },
  {
    kind: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    runtimeBaseUrl: "https://api.anthropic.com/v1",
    defaultModelId: "claude-3-5-sonnet-latest",
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    local: false,
    models: [{ id: "claude-3-5-sonnet-latest", capabilities: CHAT_WITH_STREAMING }],
  },
  {
    kind: "gemini",
    name: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    runtimeBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModelId: "gemini-2.5-flash",
    apiKeyEnvVar: "GEMINI_API_KEY",
    local: false,
    models: [{ id: "gemini-2.5-flash", capabilities: CHAT_WITH_TOOLS }],
  },
  {
    kind: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    runtimeBaseUrl: "https://openrouter.ai/api/v1",
    defaultModelId: "openai/gpt-4.1-mini",
    apiKeyEnvVar: "OPENROUTER_API_KEY",
    local: false,
    models: [{ id: "openai/gpt-4.1-mini", capabilities: CHAT_WITH_TOOLS }],
  },
  {
    kind: "ollama",
    name: "Ollama",
    baseUrl: "http://localhost:11434/v1",
    runtimeBaseUrl: "http://localhost:11434/v1",
    defaultModelId: "llama3.2",
    local: true,
    models: [{ id: "llama3.2", capabilities: CHAT_WITH_STREAMING }],
  },
  {
    kind: "lm_studio",
    name: "LM Studio",
    baseUrl: "http://127.0.0.1:1234/v1",
    runtimeBaseUrl: "http://127.0.0.1:1234/v1",
    defaultModelId: "llama3.2",
    local: true,
    models: [{ id: "llama3.2", capabilities: CHAT_WITH_STREAMING }],
  },
  {
    kind: "openai_compatible",
    name: "Custom OpenAI-compatible Provider",
    baseUrl: "https://api.example.com/v1",
    defaultModelId: "gpt-4.1-mini",
    apiKeyEnvVar: "OPENAI_API_KEY",
    local: false,
    models: [{ id: "gpt-4.1-mini", capabilities: CHAT_WITH_TOOLS }],
  },
] as const;

export function providerDefinition(kind: ProviderDefinition["kind"]): ProviderDefinition {
  const definition = PROVIDER_CATALOG.find((candidate) => candidate.kind === kind);
  if (!definition) throw new Error(`Unknown provider kind: ${kind}`);
  return definition;
}
