# ============================================================
# Farminix Unified Multi-Stage Dockerfile for KVM2
# ============================================================

# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Server
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./server/dist
COPY server/schema.sql ./server/

# Copy compiled frontend
COPY --from=frontend-builder /app/dist ./dist

# Expose HTTP port
EXPOSE 5000

# Start server
CMD ["node", "server/dist/server.js"]
