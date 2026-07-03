import { createProviderAdapter, providerConfigFromDefinition, providerDefinition } from "../src/providers/index.js";

const provider = createProviderAdapter(
  providerConfigFromDefinition(providerDefinition("openai")),
  async () => ({
    status: 200,
    body: {
      choices: [{ message: { content: "Mock provider response." } }],
    },
  }),
);

await provider.run({ message: "Say hello" }, (event) => {
  console.log(JSON.stringify(event));
});
