# Docker

Narrative Alpha Agent includes Docker support for reproducible local runs, CI smoke tests, and deployment experiments.

Docker is useful for this project because `better-sqlite3` uses native bindings. The image builds those bindings in a controlled Linux environment instead of relying on each contributor's local machine.

## Build

```bash
docker build -t narrative-alpha-agent:local .
```

The Dockerfile is multi-stage:

- `deps`: installs dependencies and builds native packages
- `test`: runs `pnpm run check` and `pnpm run replay`
- `runner`: non-root runtime image with source, dependencies, and `/data` volume

## Run Replay

```bash
docker run --rm narrative-alpha-agent:local
```

By default the container runs:

```bash
pnpm run replay
```

## Run Ingest With Persistent SQLite

```bash
docker run --rm \
  -v naa-data:/data \
  -e NAA_DATABASE_PATH=/data/naa.sqlite \
  narrative-alpha-agent:local \
  pnpm run ingest
```

## Docker Compose

```bash
docker compose up --build
```

Compose mounts a named volume at `/data` and runs replay with local deterministic providers by default.

## Secrets

Do not bake secrets into the image. Pass runtime secrets through environment variables:

```bash
docker run --rm \
  -e LANGSMITH_TRACING=true \
  -e LANGSMITH_API_KEY=lsv2_... \
  -e LANGSMITH_PROJECT=narrative-alpha-agent \
  -e DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... \
  narrative-alpha-agent:local
```

For provider credentials, use the same variables documented in `.env.example` and `docs/PROVIDERS.md`.

## CI

GitHub Actions builds the Docker image and runs a replay smoke test inside the container. This keeps the container path from drifting away from the normal local development path.
