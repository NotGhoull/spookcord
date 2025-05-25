FROM oven/bun:alpine AS base

FROM base AS builder

RUN apk update
# Set working directory
WORKDIR /app
RUN bun install -g turbo

# This assumes its being run in the base spookcord directory
COPY . .
RUN turbo prune server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN bun install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

RUN bun turbo compile

FROM base AS runner
WORKDIR /app

# Don't run production as root
USER bun
COPY --from=installer /app/apps/server/server ./server

EXPOSE 3000/tcp
CMD ./server
