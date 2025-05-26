FROM oven/bun:alpine AS base

FROM base AS builder
# Set working directory
WORKDIR /app
RUN bun install -g turbo typescript
COPY . .
RUN turbo prune web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN bun install

# Build the project
COPY --from=builder /app/out/full/ .

# TODO: Find a better way of doing this
ENV PUBLIC_SERVER_URL=localhost:3000

RUN bun turbo build

FROM base AS runner
WORKDIR /app

# Don't run production as root
USER bun

COPY --from=installer /app/apps/web/build/ ./

CMD ["bun", "./index.js"]
