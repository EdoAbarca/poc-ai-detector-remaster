# Multi-stage build for NestJS backend
# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 3333

# Start development server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run start:dev"]

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@9.15.4 && pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and production dependencies only
RUN npm install -g pnpm@9.15.4 && pnpm install --frozen-lockfile --prod

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN pnpm exec prisma generate

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3333

# Start the application
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main"]
