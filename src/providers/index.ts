import { providerConfigFromDefinition } from "./config.js";
import { PROVIDER_CATALOG } from "./catalog.js";
import { createAnthropicProvider } from "./anthropic.js";
import { createOpenAiCompatibleProvider } from "./openai-compatible.js";
import type { ProviderAdapter, ProviderConfig, ProviderTransport } from "./types.js";

export * from "./anthropic.js";
export * from "./catalog.js";
export * from "./config.js";
export * from "./openai-compatible.js";
export * from "./types.js";

export function createProviderAdapter(config: ProviderConfig, transport?: ProviderTransport): ProviderAdapter {
  if (config.kind === "anthropic") return createAnthropicProvider({ config, transport });
  return createOpenAiCompatibleProvider({ config, transport });
}

export function createDefaultProviderAdapters(transport?: ProviderTransport): ProviderAdapter[] {
  return PROVIDER_CATALOG.map((definition) => createProviderAdapter(providerConfigFromDefinition(definition), transport));
}
