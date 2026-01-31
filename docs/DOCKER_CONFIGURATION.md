# Docker Configuration - US-001A

This document describes the Docker configuration for the AI Detector application.

## Architecture

The application consists of 5 containerized services:

### Services

1. **frontend** - React application (Vite)
   - Port: 5173 (development) / 80 (production)
   - Container: `react-frontend`
   - Hot-reload: Enabled via volume mounts in development

2. **backend** - NestJS API
   - Port: 3333
   - Container: `nest-backend`
   - Dependencies: PostgreSQL
   - Hot-reload: Enabled via volume mounts in development

3. **fdgpt** - Fast-Detect-GPT AI service
   - Port: 5000 (host) → 8001 (container)
   - Container: `fdgpt`
   - Base Image: nvidia/cuda:12.1.0-runtime-ubuntu20.04
   - GPU: Requires NVIDIA GPU with CUDA support
   - Hot-reload: Enabled via volume mounts in development

4. **postgres** - PostgreSQL database
   - Port: 5432
   - Container: `postgres`
   - Version: 13
   - Persistent storage: `postgres_data` volume

5. **redis** - Redis cache
   - Port: 6379
   - Container: `redis`
   - Version: 6

## Network

All services communicate via the `ai-detector-network` Docker network.

## Multi-Stage Builds

All application services (frontend, backend, fdgpt) use multi-stage Dockerfiles:

- **Development stage**: Includes all dependencies and development tools
- **Production stage**: Optimized images with only runtime dependencies

## Usage

### Development Mode

Start all services with hot-reload enabled:

```bash
make start
```

Or manually:

```bash
docker compose up -d
```

### Production Mode

Build and start production-optimized containers:

```bash
make build-prod
make start-prod
```

Or manually:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Other Commands

```bash
make stop          # Stop all services
make restart       # Restart all services
make logs          # View logs (all services)
make logs service=backend  # View logs for specific service
make clean         # Remove containers and volumes
make build         # Build all containers
```

## Environment Variables

Environment variables are managed via `.env` files:

- **Backend**: `./nest-backend/.env`
  - `DATABASE_URL`: PostgreSQL connection string
  - `JWT_SECRET`: JWT secret key
  - `PORT`: Backend port (3333)
  - `POSTGRES_USER`: Database user
  - `POSTGRES_PASSWORD`: Database password
  - `POSTGRES_DB`: Database name

## Volume Mounts (Development)

For hot-reload during development:

- **Frontend**: `./react-frontend:/app` (excluding node_modules)
- **Backend**: `./nest-backend:/app` (excluding node_modules)
- **Fast-Detect-GPT**: 
  - `./fast-detect-gpt/app:/app/app`
  - `./fast-detect-gpt/offload:/app/offload`
  - `./fast-detect-gpt/cache:/app/cache`

## GPU Requirements

The `fdgpt` service requires:
- NVIDIA GPU with CUDA support
- NVIDIA Docker runtime installed
- GPU drivers compatible with CUDA 12.1

To verify GPU support:

```bash
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu20.04 nvidia-smi
```

## Service Dependencies

```
frontend → backend → postgres
fdgpt (independent)
redis (independent)
```

## Health Checks

- **fdgpt**: HTTP health check at `/health` endpoint

## Acceptance Criteria ✅

- [x] Individual Dockerfiles for each service (frontend, backend, AI service)
- [x] docker-compose.yml orchestrates all services
- [x] Services can communicate via Docker network (`ai-detector-network`)
- [x] PostgreSQL and Redis containers included
- [x] Volume mounts for development hot-reload
- [x] Environment variables properly configured
- [x] Multi-stage builds for production
- [x] NVIDIA CUDA image (Ubuntu 20.04) for Flask service
- [x] GPU usage configured in docker-compose.yml for fdgpt service
- [x] Service ports configured correctly:
  - frontend: 5173
  - backend: 3333
  - fdgpt: 5000 (host) → 8001 (container)
  - postgres: 5432
  - redis: 6379
