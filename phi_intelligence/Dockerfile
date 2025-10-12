FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including tsx for TypeScript)
RUN npm ci

# Copy environment
COPY .env ./

# Copy server source code
COPY server ./server
COPY shared ./shared
COPY tsconfig.json ./

# Create necessary directories
RUN mkdir -p uploads/temp logs

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run with tsx (TypeScript executor) - no build needed
ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "tsx", "server/index.ts"]
