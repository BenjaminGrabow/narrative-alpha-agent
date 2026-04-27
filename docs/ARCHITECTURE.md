# Architecture

Narrative Alpha Agent is organized as a set of injectable domain services orchestrated by LangGraph.

## Runtime Flow

```text
Document[] + timestamp
        |
        v
IngestionNode
        |
        v
PreprocessingNode
        |
        v
ClusteringNode
        |
        v
NarrativeAgentNode
        |
        v
ScoringNode
        |
        v
ActionNode
```

## LangGraph State

The graph state is declared in `src/graph/state.ts` and contains:

- `timestamp`: the current live or replay cursor
- `documents`: documents visible at the current cursor
- `clusters`: threshold-based document clusters
- `narratives`: evolving narrative state
- `logs`: operational and scoring explanations

The graph is compiled with a `MemorySaver` checkpointer. Long-term narrative memory is persisted through `NarrativeRepository`.

## Service Boundaries

- `ClusteringService`: embeds text, builds threshold clusters, writes vectors
- `NarrativeLifecycleService`: computes narrative metrics and state transitions
- `ScoringService`: computes NIP and scoring reasons
- `AlertService`: emits actions through pluggable notifiers
- `ReplayEngine`: drives repeated graph invocation over a historical timeline

## Ports

Ports live in `src/types/ports.ts`:

- `LlmClient`
- `EmbeddingProvider`
- `VectorStore`
- `NarrativeRepository`
- `Notifier`
- `Queue`
- `DocumentSourceConnector`

Production integrations should implement these ports rather than changing graph nodes.

## Persistence

SQLite stores latest narrative state in `SqliteNarrativeRepository`. Tests use `InMemoryNarrativeRepository` to avoid filesystem coupling and keep replay deterministic.

## Observability

The MVP exposes structured logs inside graph state. These logs explain ingestion counts, cluster counts, narrative updates, NIP drivers, and action decisions. A production deployment should route these logs into OpenTelemetry or a structured logging backend.
