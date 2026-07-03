import { describe, expect, it, vi } from "vitest";
import {
  apiKeyFromEnv,
  createProviderAdapter,
  providerConfigFromDefinition,
  providerDefinition,
  runtimeFor,
  selectedBaseUrl,
} from "../src/providers/index.js";

describe("providers", () => {
  it("normalizes config and reads API keys from env", () => {
    const config = providerConfigFromDefinition(providerDefinition("openai"), " OpenAI ");
    expect(config.id).toBe("openai");
    expect(selectedBaseUrl(config)).toBe("https://api.openai.com/v1");
    expect(apiKeyFromEnv(config, { OPENAI_API_KEY: " sk-test " })).toBe("sk-test");
  });

  it("reports auth_missing when a hosted provider key is absent", async () => {
    const adapter = createProviderAdapter(providerConfigFromDefinition(providerDefinition("openai")));
    const detection = await adapter.detect();
    if (!process.env.OPENAI_API_KEY) {
      expect(detection.status).toBe("auth_missing");
      expect(detection.installed).toBe(false);
    }
  });

  it("builds OpenAI-compatible payloads", () => {
    const config = providerConfigFromDefinition(providerDefinition("openai"));
    const runtime = runtimeFor(config);
    expect(runtime.endpoint()).toBe("https://api.openai.com/v1/chat/completions");
    expect(runtime.payload({ message: "hi", systemPrompt: "be brief" })).toEqual({
      model: "gpt-4.1-mini",
      stream: false,
      messages: [
        { role: "system", content: "be brief" },
        { role: "user", content: "hi" },
      ],
    });
  });

  it("runs with a mocked transport", async () => {
    const transport = vi.fn(async () => ({
      status: 200,
      body: { choices: [{ message: { content: "ok" } }] },
    }));
    const adapter = createProviderAdapter(providerConfigFromDefinition(providerDefinition("openai")), transport);
    const events: unknown[] = [];
    await adapter.run({ message: "test" }, (event) => events.push(event));
    expect(transport).toHaveBeenCalledOnce();
    expect(events).toContainEqual({ kind: "text_delta", text: "ok" });
    expect(events.at(-1)).toEqual({ kind: "done" });
  });
});
