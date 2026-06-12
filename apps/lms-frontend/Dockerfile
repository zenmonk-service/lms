ARG NODE_VERSION=24.13.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

# ---
FROM base AS prepare
RUN npm install -g turbo
COPY . .
RUN turbo prune lms-frontend --docker

# ---
FROM base AS builder
COPY --from=prepare /app/out/json/ .
RUN npm install
# Build the project
COPY --from=prepare /app/out/full/ .

RUN npx turbo build

# ---
FROM node:${NODE_VERSION}-alpine AS runner
# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/lms-frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/lms-frontend/.next/static ./apps/lms-frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/lms-frontend/public ./apps/lms-frontend/public

CMD node apps/lms-frontend/server.js