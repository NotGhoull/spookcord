FROM oven/bun:1.1.18-alpine AS base

# --- Building ---
FROM base AS builder
RUN apk update

WORKDIR /app

COPY . .

RUN bunx turbo prune server --docker

# --- Installer ---
FROM base AS installer

WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/ .

# Install deps & Compile
RUN bun install --production --ignore-scripts --frozen-lockfile
RUN bunx turbo compile

# --- Runner ---
FROM base AS runner

WORKDIR /app

USER bun

COPY --from=installer --chown=bun:bun /app/apps/server/server ./server

EXPOSE 3000/tcp

CMD ["./server"]
