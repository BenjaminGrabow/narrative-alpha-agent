# Architecture

Narrative Alpha Agent is organized as a set of injectable domain services orchestrated by LangGraph and instrumented for LangSmith.

The runtime uses LangGraph and LangSmith for the parts of the system where they are technically useful:

- LangGraph provides typed state, named graph nodes, checkpointing, and replay re-entry.
- LangSmith provides trace visibility for graph runs, node spans, run metadata, tags, and replay checkpoints.
- Model access remains provider-agnostic behind ports so LangGraph logic is not coupled to one LLM vendor.

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

## LangSmith Tracing

`NarrativeGraphRunner` passes runnable configuration into every graph invocation:

- `runName`: stable application-level run name
- `tags`: searchable labels such as `naa`, `langgraph`, and `narrative-replay`
- metadata: app name, replay timestamp, visible document count, LangSmith project, and tracing status
- `thread_id`: checkpoint and replay re-entry identifier

With `LANGSMITH_TRACING=true`, LangGraph/LangChain records graph runs and child node spans in LangSmith. This is especially useful during replay because each historical checkpoint can be inspected as a trace with its own thread ID.

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

The MVP exposes structured logs inside graph state and LangSmith trace metadata at the graph runner boundary. Logs explain ingestion counts, cluster counts, narrative updates, NIP drivers, and action decisions. LangSmith traces provide run-level inspection across the LangGraph execution path.

A production deployment can additionally route these logs into OpenTelemetry or a structured logging backend.
