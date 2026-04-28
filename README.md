# Narrative Alpha Agent

LangGraph + LangSmith infrastructure for detecting, scoring, observing, and replaying emerging social and news narratives.

Narrative Alpha Agent (NAA) is a production-oriented TypeScript MVP for emerging narrative research. It uses LangGraph as the stateful orchestration layer, LangSmith-ready tracing for graph observability, deterministic local embeddings by default, SQLite for persisted long-term narrative memory, and a replay engine designed for historical backtesting without future data leakage.

## LangGraph And LangSmith Integration

NAA uses LangGraph and LangSmith as first-class infrastructure components:

- **LangGraph orchestration:** every narrative run is represented as a typed graph with named nodes, checkpointable state, and replay re-entry.
- **LangSmith observability:** graph invocations carry run names, tags, metadata, timestamps, document counts, and thread IDs for trace inspection.
- **Provider-agnostic model access:** OpenAI-compatible providers, Claude, DeepSeek, OpenRouter, Gemini, Cohere, Mistral, Groq, Together, xAI, Azure OpenAI, and local deterministic mode are all supported through clean ports.
- **Production discipline:** strict TypeScript, SQLite persistence, deterministic replay, CI quality gates, branch protection, issue templates, security policy, and documented operations.

LangSmith tracing is opt-in and configured through `.env.example`:

```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=narrative-alpha-agent
LANGSMITH_TAGS=naa,langgraph,narrative-replay
```

## Architecture

```text
timestamped documents
        |
        v
+------------------+
|  IngestionNode   |  dedupe, visibility cutoff
+------------------+
        |
        v
+------------------+
| PreprocessingNode|  text normalization
+------------------+
        |
        v
+------------------+
|  ClusteringNode  |  embeddings + cosine similarity
+------------------+
        |
        v
+----------------------+
| NarrativeAgentNode   |  stateful lifecycle + SQLite memory
+----------------------+
        |
        v
+------------------+
|   ScoringNode    |  Narrative Impact Probability
+------------------+
        |
        v
+------------------+
|   ActionNode     |  console + notifier alerts
+------------------+
```

The code is organized around injectable services rather than prompt-heavy business logic:

- `src/graph` contains LangGraph state and graph construction.
- `src/nodes` contains the six required orchestration nodes.
- `src/services` contains clustering, lifecycle, scoring, embeddings, vector store, queue, and alerting.
- `src/db` contains SQLite and in-memory narrative repositories.
- `src/backtest` contains deterministic replay and demo fixtures.
- `tests` covers clustering, scoring, replay leakage, and lifecycle transitions.

## LangGraph Usage

`createNarrativeGraph` builds a `StateGraph` with a strongly typed global state:

```ts
type SystemState = {
  timestamp: number;
  documents: Document[];
  clusters: Cluster[];
  narratives: Narrative[];
  logs: string[];
};
```

The graph is compiled with a `MemorySaver` checkpointer, and every node returns partial state updates. The graph can be invoked repeatedly with the same runner, which is what replay uses for time-cursor re-entry.

## LangSmith Observability

`NarrativeGraphRunner` passes LangChain runnable config into each LangGraph invocation:

- `runName`
- `tags`
- run metadata for app name, replay timestamp, document count, project, and tracing status
- `thread_id` for checkpointing and replay-specific trace grouping

When `LANGSMITH_TRACING=true`, these graph runs and node spans are visible in LangSmith under the configured project. This makes replay checkpoints, live ingestion runs, and alert-producing executions inspectable instead of opaque.

## Narrative Impact Probability

NAA calculates NIP as a configurable weighted score:

```text
NIP = w1 * velocity
    + w2 * sourceDiversity
    + w3 * crossPlatformPresence
    + w4 * sentimentShift
```

Defaults live in `src/config/defaults.ts`. Scoring also emits human-readable logs such as high velocity, cross-platform presence, source diversity, and sentiment shift.

## Backtesting

The replay engine advances through a timeline and only passes documents visible at the current timestamp:

```ts
for (const t of timeline) {
  const visibleData = data.filter((d) => d.timestamp <= t);
  await runGraph(visibleData);
}
```

`ReplayEngine` sorts input deterministically, asserts that no future documents are present in graph state, and carries prior narrative state forward between checkpoints. This keeps live ingestion and historical replay on the same execution path.

## Run Locally

```bash
pnpm install
pnpm run replay
pnpm run ingest
pnpm run dev
```

Docker:

```bash
docker build -t narrative-alpha-agent:local .
docker run --rm narrative-alpha-agent:local
```

Quality gates:

```bash
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
```

## Project Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Backtesting](docs/BACKTESTING.md)
- [Operations](docs/OPERATIONS.md)
- [Providers and Secrets](docs/PROVIDERS.md)
- [Observability](docs/OBSERVABILITY.md)
- [Notifications](docs/NOTIFICATIONS.md)
- [Docker](docs/DOCKER.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Demo Dataset

`src/backtest/demoDataset.ts` simulates:

- early formation of an AI-agent payments narrative
- acceleration across Twitter, Telegram, and news
- peak and cooling phases
- an unrelated market document to test cluster separation

`pnpm run replay` prints NIP over time, narrative states, and graph logs.

## Extensibility

The MVP is intentionally local-first but replaceable:

- LLM access uses a multi-provider registry with local, OpenAI, Anthropic Claude, DeepSeek, OpenRouter, Google Gemini, Cohere, Mistral, Groq, Together, xAI, Azure OpenAI, and custom OpenAI-compatible support.
- Embeddings implement the `EmbeddingProvider` port.
- Vector search implements the `VectorStore` port.
- Alerts implement the `Notifier` port with console, Discord webhook, and Telegram stub examples.
- Narrative memory implements the `NarrativeRepository` port with SQLite and in-memory backends.

## Limitations

- The default embedding provider is deterministic and useful for tests, not semantic production quality.
- Clustering is threshold-based and does not yet perform split/merge maintenance.
- Source authority is not modeled beyond source diversity.
- The Telegram notifier is a stub.
- SQLite persistence stores the latest version of each narrative, not a full event-sourced history.

## Future Improvements

- Add source connectors for social APIs, RSS, and market data.
- Add event-sourced narrative snapshots for richer historical analysis.
- Add offline evaluation metrics for precision, recall, and lead time.
- Add Redis-backed queue and distributed workers.
- Add richer lifecycle models with decay, source authority, and engagement-adjusted velocity.
- Add real embedding providers and a durable vector store such as Qdrant, LanceDB, or pgvector.
