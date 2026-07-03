# Security And Permissions

The default mode is `safe`.

## Safe

Safe mode should keep operations inside the selected workspace and avoid broad shell access. For providers, safe means chat-only unless a tool loop is explicitly implemented and tested.

## Power User

Power user mode can enable broader documented capabilities for a CLI agent, but it must not silently use dangerous bypass flags. Each adapter owns its own mapping because CLIs do not share permission semantics.

## Secrets

Do not persist API keys in this repository. Use environment variables:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`

Local providers such as Ollama and LM Studio should work without keys.
