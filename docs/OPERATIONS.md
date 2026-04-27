# Operations

## Local Commands

```bash
pnpm install
pnpm run replay
pnpm run ingest
pnpm run dev
pnpm run check
```

## Data and Storage

`pnpm run ingest` writes narrative state to `naa.sqlite` in the project root. SQLite files are ignored by Git.

`pnpm run replay` uses an in-memory database by default and does not write persistent state.

## Configuration

Defaults live in `src/config/defaults.ts`.

Key values:

- `clusterSimilarityThreshold`
- `actionThreshold`
- `replayWindowMs`
- `deterministicReplay`
- `scoringWeights`

## Alerting

The default runtime uses:

- `ConsoleNotifier`
- `TelegramNotifierStub`

Real notifier implementations should implement `Notifier` and be wired through runtime construction.

## LLM and Embeddings

The default MVP path does not require external paid APIs.

LLM credentials are configured with `.env.example`. The provider registry supports local, OpenAI, Anthropic Claude, DeepSeek, OpenRouter, Google Gemini, Cohere, Mistral, Groq, Together, xAI, Azure OpenAI, and custom OpenAI-compatible APIs.

The deterministic local embedding provider is used by default for replay stability.

## CI

GitHub Actions runs:

- install with pnpm
- format check through `pnpm run check`
- ESLint
- TypeScript strict mode
- Vitest
- replay smoke test
