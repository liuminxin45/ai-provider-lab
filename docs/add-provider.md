# Add A Provider

Use this checklist when adding a direct model provider.

1. If it supports OpenAI-compatible `/chat/completions`, add metadata to `src/providers/catalog.ts`.
2. If it has a unique wire protocol, create a runtime similar to `src/providers/anthropic.ts`.
3. Register it through `createProviderAdapter` in `src/providers/index.ts`.
4. Read API keys from environment variables only.
5. Add tests for config normalization, base URL selection, headers, payload, and response text extraction.

Provider adapters must expose:

- `id`
- `label`
- `detect()`
- `buildConfig()`
- `run(request, emit)`
- `docs`

Do not add UI settings or secret storage here.
