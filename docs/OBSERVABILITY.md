# Observability

Narrative Alpha Agent uses LangGraph as its execution layer, so graph runs can be traced with LangSmith through LangChain's standard tracing environment variables.

Tracing is disabled by default to keep local development and replay offline.

## Enable LangSmith

Copy `.env.example` to `.env` and set:

```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=narrative-alpha-agent
LANGSMITH_RUN_NAME=narrative-alpha-agent
LANGSMITH_TAGS=naa,langgraph,narrative-replay
```

Optional:

```bash
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_WORKSPACE_ID=...
```

The runtime reads these values in `src/config/observability.ts`.

## What Gets Traced

`NarrativeGraphRunner` passes LangChain runnable config into every graph invocation:

- `runName`
- `tags`
- metadata containing app name, replay timestamp, document count, project, and tracing status
- `thread_id` for LangGraph checkpointing and replay re-entry

When LangSmith tracing is enabled, LangGraph/LangChain records the graph run and child node spans under the configured project.

## Replay Tracing

Replay uses a timestamp-specific thread ID:

```text
replay-1735689600000
replay-1735693200000
...
```

This makes historical checkpoints searchable in LangSmith by run metadata and thread ID.

## Local Safety

- No traces are emitted unless `LANGSMITH_TRACING=true`.
- No LangSmith API key is required for tests, replay, or local development.
- Do not commit real `LANGSMITH_API_KEY` values.
