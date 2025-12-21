# Build stage
FROM node:20-slim AS builder

# Install pnpm and OpenSSL (needed for Prisma)
RUN npm install -g pnpm && \
    apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files for all packages
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

# Build shared package first (clean build)
RUN rm -f packages/shared/tsconfig.tsbuildinfo && pnpm --filter @anvago/shared build

# Generate Prisma client and build server
RUN pnpm --filter @anvago/server build

# Production stage
FROM node:20-slim AS production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

# Install pnpm and all dependencies (need prisma CLI for migrations)
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma

# Generate Prisma client for production
RUN cd packages/server && pnpm prisma generate

ENV NODE_ENV=production

# Railway provides PORT env variable
EXPOSE ${PORT:-3001}

WORKDIR /app/packages/server

# Run migrations and start server
CMD ["sh", "-c", "pnpm prisma migrate deploy && echo 'Migration done, starting server...' && node dist/index.js"]
