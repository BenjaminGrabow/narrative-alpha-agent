# Backtesting

Backtesting is implemented in `src/backtest/ReplayEngine.ts`.

## Principle

Replay must only expose data that would have been visible at the current replay timestamp.

```ts
const visibleData = orderedDocuments.filter((document) => document.timestamp <= timestamp);
```

The engine asserts this invariant after every graph invocation. If a future document appears in graph state, replay throws.

## Determinism

The replay path is deterministic by design:

- Documents are sorted by timestamp and ID.
- The default embedding provider is local and deterministic.
- Clustering uses deterministic iteration order.
- Tests use in-memory narrative persistence.
- No default path depends on external APIs.

## State Carryover

Replay carries `clusters` and `narratives` from the prior checkpoint into the next graph invocation. This mirrors the production shape where the graph can re-enter with existing state while only receiving newly visible evidence.

## Validation

Replay behavior is covered by:

- `tests/replay.test.ts`: no future leakage
- `tests/replay.test.ts`: deterministic outputs for identical inputs
- `tests/lifecycle.test.ts`: narrative state evolution across checkpoints

## Limitations

- The MVP stores latest narrative state, not full event-sourced snapshots.
- Historical source availability is modeled only with document timestamps.
- Market outcome labels are not included yet, so this is narrative-state replay rather than alpha PnL evaluation.
