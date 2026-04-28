# Observability

Narrative Alpha Agent is built to be LangSmith-observable. LangGraph is the execution layer, and graph runs can be traced with LangSmith through LangChain's standard tracing environment variables.

Tracing is disabled by default to keep local development and replay offline.

For a LangChain/LangGraph review, this is one of the most important integration points: NAA does not treat observability as an afterthought. The graph runner attaches run names, tags, replay metadata, and thread IDs so narrative runs can be inspected after the fact.

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

This gives reviewers and operators visibility into:

- which documents were visible at a replay checkpoint
- which graph nodes executed
- how many clusters and narratives were produced
- which run/thread generated an alert
- whether live and replay paths are using the same graph execution surface

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
