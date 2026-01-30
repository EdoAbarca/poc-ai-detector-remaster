FROM node:20-alpine

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

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3333

# Start the application
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run start:prod"]
