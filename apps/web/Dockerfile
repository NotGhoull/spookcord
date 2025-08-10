FROM oven/bun:1.2.18-alpine AS base

# --- Building ---
FROM base AS builder
RUN apk update

WORKDIR /app

COPY . .

RUN bunx turbo prune web --docker

# --- Installer ---
FROM base AS installer

WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/ .

# Install deps & Compile
# Note: Once we fix --production and --frozen-lockfile just destroying it
#       then we should go back to using those, since this is incredibly bloated
RUN bun install --ignore-scripts
# We should find a better way to do this
ENV PUBLIC_SERVER_URL=http://localhost:3000
RUN bunx turbo build

# --- Runner ---
FROM base AS runner

WORKDIR /app

USER bun

COPY --from=installer --chown=bun:bun /app/apps/web/build ./
COPY --from=installer --chown=bun:bun /app/node_modules ./node_modules

EXPOSE 3000/tcp

CMD ["bun", "run", "start"]
