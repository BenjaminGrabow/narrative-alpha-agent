# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

FROM base AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS test
COPY . .
RUN pnpm run check
RUN pnpm run replay

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY src ./src
COPY README.md LICENSE ./
RUN groupadd --system naa \
  && useradd --system --gid naa --home-dir /app naa \
  && mkdir -p /data \
  && chown -R naa:naa /app /data
USER naa
VOLUME ["/data"]
ENV NAA_DATABASE_PATH=/data/naa.sqlite
CMD ["pnpm", "run", "replay"]
