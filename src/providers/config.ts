import type { DetectionResult } from "../core/types.js";
import type { ProviderConfig, ProviderDefinition } from "./types.js";

export function normalizeProviderConfig(config: ProviderConfig): ProviderConfig {
  const id = config.id.trim().toLowerCase();
  const baseUrl = normalizeOptional(config.baseUrl);
  const runtimeBaseUrl = normalizeOptional(config.runtimeBaseUrl);
  const modelId = normalizeOptional(config.modelId);
  const apiKeyEnvVar = normalizeOptional(config.apiKeyEnvVar);
  const models = config.models.filter((model) => model.id.trim().length > 0);
  if (!id) throw new Error("Provider id cannot be empty.");
  if (!models.length) throw new Error(`Provider ${id} must define at least one model.`);
  return {
    ...config,
    id,
    baseUrl,
    runtimeBaseUrl,
    modelId,
    apiKeyEnvVar,
    models,
  };
}

export function providerConfigFromDefinition(definition: ProviderDefinition, id: string = definition.kind): ProviderConfig {
  return normalizeProviderConfig({ ...definition, id });
}

export function selectedModelId(config: ProviderConfig): string {
  return config.modelId ?? config.defaultModelId;
}

export function selectedBaseUrl(config: ProviderConfig): string {
  const baseUrl = config.runtimeBaseUrl ?? config.baseUrl;
  if (!baseUrl) throw new Error(`Provider ${config.id} needs a base URL.`);
  return baseUrl.replace(/\/+$/, "");
}

export function apiKeyFromEnv(config: ProviderConfig, env: NodeJS.ProcessEnv = process.env): string | undefined {
  if (!config.apiKeyEnvVar) return undefined;
  const value = env[config.apiKeyEnvVar]?.trim();
  return value || undefined;
}

export function providerDetection(config: ProviderConfig, env: NodeJS.ProcessEnv = process.env): DetectionResult {
  if (config.local) {
    return {
      installed: true,
      status: "configured",
      reason: "Local provider endpoint is configured; reachability is checked only when a request is sent.",
    };
  }

  if (!config.apiKeyEnvVar) {
    return {
      installed: true,
      status: "configured",
      reason: "Provider does not declare an API key environment variable.",
    };
  }

  if (apiKeyFromEnv(config, env)) {
    return {
      installed: true,
      status: "configured",
      reason: `${config.apiKeyEnvVar} is set; endpoint reachability is checked when a request is sent.`,
    };
  }

  return {
    installed: false,
    status: "auth_missing",
    reason: `Set ${config.apiKeyEnvVar} before using ${config.name}.`,
  };
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}
