# Build stage
FROM node:20-slim AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files
COPY packages/shared/package.json ./packages/shared/
COPY packages/client/package.json ./packages/client/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/client ./packages/client

# Build shared package first (clean build)
RUN rm -f packages/shared/tsconfig.tsbuildinfo && pnpm --filter @anvago/shared build

# Build client with API URL arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter @anvago/client build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

# Copy nginx config template
COPY packages/client/nginx.conf /etc/nginx/templates/default.conf.template

# Railway provides PORT env variable, default to 80
ENV PORT=80

EXPOSE ${PORT}

# nginx:alpine image automatically processes templates with envsubst
# This replaces ${PORT} in the config with the actual PORT value
CMD ["sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
