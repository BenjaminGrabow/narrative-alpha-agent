# Contributing

Thanks for taking the time to improve Narrative Alpha Agent.

## Development Setup

```bash
pnpm install
pnpm run replay
pnpm run check
```

Use Node.js 20 or newer and pnpm 9 or newer. Native SQLite bindings are built during install through `better-sqlite3`.

## Engineering Standards

- Keep TypeScript strict and avoid `any`.
- Prefer dependency-injected services over hardcoded implementations.
- Keep LangGraph nodes thin; put domain behavior in services.
- Preserve deterministic replay behavior. Any randomness must be injectable and seeded.
- Do not add external paid API requirements to the default path.
- Add or update tests for behavior changes.
- Keep PRs small enough to review.

## Pull Request Checklist

Before opening a PR:

```bash
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run replay
```

PR descriptions should include:

- Summary
- What changed
- Tests
- Limitations
- Follow-up work

## Adding Providers

New providers should implement the existing ports in `src/types/ports.ts`. Keep provider configuration outside graph nodes and wire dependencies through `createRuntime`.

## Adding Replay Fixtures

Replay fixtures must use explicit timestamps and should include at least one negative-control document that should not join the main narrative cluster.
