# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Run as non-root user for security
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
