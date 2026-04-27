# Narrative Alpha Agent

Narrative Alpha Agent (NAA) is a production-oriented TypeScript MVP for detecting, scoring, and replaying emerging social and news narratives. It uses LangGraph as the orchestration layer, deterministic local embeddings by default, SQLite for persisted long-term narrative memory, and a replay engine designed for backtesting without future data leakage.

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

- LLM access uses an OpenAI-compatible interface in `OpenAICompatibleLlmClient`.
- Embeddings implement the `EmbeddingProvider` port.
- Vector search implements the `VectorStore` port.
- Alerts implement the `Notifier` port with console and Telegram stub examples.
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
