# Providers and Secrets

Narrative Alpha Agent is local-first by default. It does not require paid APIs to run tests, replay, or the demo.

Secrets are configured through environment variables. Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Never commit `.env`.

## LLM Provider Selection

Set `NAA_LLM_PROVIDER` to one of:

- `local`
- `openai`
- `anthropic`
- `deepseek`
- `openrouter`
- `google`
- `cohere`
- `mistral`
- `groq`
- `together`
- `xai`
- `azure-openai`
- `custom-openai-compatible`

The runtime reads provider configuration in `src/config/secrets.ts` and creates clients through `src/services/MultiProviderLlmClient.ts`.

## Provider Variables

| Provider                 | Required variables                                                         | Notes                                             |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------- |
| local                    | none                                                                       | Deterministic echo client for offline development |
| openai                   | `OPENAI_API_KEY`, `OPENAI_MODEL`                                           | Uses `/chat/completions`                          |
| anthropic                | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`                                     | Native Claude Messages API                        |
| deepseek                 | `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`                                       | OpenAI-compatible                                 |
| openrouter               | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`                                   | OpenAI-compatible aggregator                      |
| google                   | `GOOGLE_API_KEY`, `GOOGLE_MODEL`                                           | Native Gemini API                                 |
| cohere                   | `COHERE_API_KEY`, `COHERE_MODEL`                                           | Native Cohere chat API                            |
| mistral                  | `MISTRAL_API_KEY`, `MISTRAL_MODEL`                                         | OpenAI-compatible                                 |
| groq                     | `GROQ_API_KEY`, `GROQ_MODEL`                                               | OpenAI-compatible                                 |
| together                 | `TOGETHER_API_KEY`, `TOGETHER_MODEL`                                       | OpenAI-compatible                                 |
| xai                      | `XAI_API_KEY`, `XAI_MODEL`                                                 | OpenAI-compatible                                 |
| azure-openai             | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` | Azure deployment endpoint                         |
| custom-openai-compatible | `CUSTOM_OPENAI_API_KEY`, `CUSTOM_OPENAI_BASE_URL`, `CUSTOM_OPENAI_MODEL`   | Any compatible provider                           |

## Example

```bash
NAA_LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

```bash
NAA_LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
```

```bash
NAA_LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_APP_URL=https://github.com/BenjaminGrabow/narrative-alpha-agent
OPENROUTER_APP_NAME=Narrative Alpha Agent
```

## Embeddings

The default embedding provider is `DeterministicEmbeddingProvider`, which keeps replay stable and offline.

Production embedding providers should implement `EmbeddingProvider` from `src/types/ports.ts` and be injected in runtime construction. Recommended future providers:

- OpenAI embeddings
- Voyage AI
- Cohere Embed
- Jina AI
- local sentence-transformers service

## Source Connectors

Source credentials are included in `.env.example` as placeholders:

- `TWITTER_BEARER_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `NEWS_API_KEY`

Real source connectors should implement `DocumentSourceConnector` from `src/types/ports.ts`.

## Security

- Do not commit `.env`.
- Prefer separate API keys per environment.
- Scope keys to the minimum provider permissions.
- Rotate keys after accidental disclosure.
- Keep production secrets in a secret manager, not in local files.
