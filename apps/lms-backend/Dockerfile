ARG NODE_VERSION=24.13.1

FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# ---- Prepare ----
FROM base AS prepare

RUN npm install -g turbo

COPY . .

RUN turbo prune leave-menagement-service --docker

# ---- Install dependencies ----
FROM base AS runner

WORKDIR /app

# Install production dependencies
COPY --from=prepare /app/out/json/ .

RUN npm install --omit=dev

# Copy application source
COPY --from=prepare /app/out/full/ .

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sequelizejs

USER sequelizejs

EXPOSE 8080

CMD ["node", "apps/lms-backend/server.js"]