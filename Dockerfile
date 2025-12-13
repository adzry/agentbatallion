# Agent Battalion v2.0 - Production Dockerfile
# Multi-stage build for optimized image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY packages/agent-battalion/package*.json ./packages/agent-battalion/
COPY packages/agent-battalion-mcp/package*.json ./packages/agent-battalion-mcp/

# Install all dependencies
RUN npm ci --workspaces

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build --workspaces

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install production dependencies only
COPY package*.json ./
COPY packages/agent-battalion/package*.json ./packages/agent-battalion/
COPY packages/agent-battalion-mcp/package*.json ./packages/agent-battalion-mcp/

RUN npm ci --workspaces --only=production

# Copy built files
COPY --from=builder /app/packages/agent-battalion/dist ./packages/agent-battalion/dist
COPY --from=builder /app/packages/agent-battalion/public ./packages/agent-battalion/public
COPY --from=builder /app/packages/agent-battalion-mcp/dist ./packages/agent-battalion-mcp/dist

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Expose port
EXPOSE 4000

# Start command
CMD ["node", "packages/agent-battalion/dist/web/server.js"]
