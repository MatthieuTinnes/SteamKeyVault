# Frontend Dockerfile for SteamKeyVault
# Build stage
FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG VITE_API_BASE_URL=/api

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Set environment variable for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application (skip type-check in Docker build for reliability)
RUN pnpm run build-only

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
