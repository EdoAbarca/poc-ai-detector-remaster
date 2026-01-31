###############################################################################
# Makefile for Development
# This file provides commands to manage the project lifecycle
###############################################################################

.PHONY: help setup start stop test clean migrate logs build restart dev
.PHONY: frontend backend fast-detect-gpt postgres prisma-studio
.PHONY: test-frontend test-backend

# Default target - show help
.DEFAULT_GOAL := help

###############################################################################
# Main Commands (as per US-001B)
###############################################################################

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Main commands:'
	@echo '  setup      - Install all dependencies (npm/pnpm/pip)'
	@echo '  start      - Start all services with docker-compose'
	@echo '  stop       - Stop all services'
	@echo '  test       - Run all tests (frontend + backend)'
	@echo '  migrate    - Run database migrations'
	@echo '  clean      - Clean up containers and volumes'
	@echo '  logs       - View logs from a specific service'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install dependencies for all services
	@echo "================================================"
	@echo "Installing project dependencies..."
	@echo "================================================"
	@echo "Installing frontend dependencies..."
	cd react-frontend && pnpm install
	@echo ""
	@echo "Installing backend dependencies..."
	cd nest-backend && pnpm install
	@echo ""
	@echo "Setting up Prisma..."
	cd nest-backend && pnpm exec prisma generate
	@echo ""
	@echo "Installing fast-detect-gpt dependencies..."
	cd fast-detect-gpt && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
	@echo ""
	@echo "✓ Setup complete!"

start: ## Start all services with docker-compose
	@echo "Starting all services..."
	docker compose up -d
	@echo "✓ All services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3333"
	@echo "Fast-Detect-GPT: http://localhost:8001"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

stop: ## Stop all services
	@echo "Stopping all services..."
	docker compose down
	@echo "✓ All services stopped!"

test: ## Run all tests (frontend + backend)
	@echo "================================================"
	@echo "Running all tests..."
	@echo "================================================"
	@echo "Running frontend tests..."
	cd react-frontend && pnpm test
	@echo ""
	@echo "Running backend tests..."
	cd nest-backend && pnpm test
	@echo ""
	@echo "✓ All tests complete!"

migrate: ## Run database migrations
	@echo "Running database migrations..."
	cd nest-backend && pnpm exec prisma migrate dev
	@echo "✓ Migrations complete!"

clean: ## Clean up containers and volumes
	@echo "Cleaning up containers and volumes..."
	docker compose down -v
	@echo "Removing local data directories..."
	rm -rf postgres_data
	@echo "✓ Cleanup complete!"

logs: ## View logs from a specific service (usage: make logs service=backend)
	@if [ -z "$(service)" ]; then \
		echo "Usage: make logs service=<service-name>"; \
		echo "Available services: frontend, backend, fast-detect-gpt, postgres, redis"; \
		docker compose logs -f; \
	else \
		echo "Showing logs for $(service)..."; \
		docker compose logs -f $(service); \
	fi

###############################################################################
# Additional Commands
###############################################################################

build: ## Build all Docker containers
	@echo "Building all Docker containers..."
	docker compose build
	@echo "✓ Build complete!"

restart: ## Restart all services
	@echo "Restarting all services..."
	docker compose restart
	@echo "✓ Services restarted!"

###############################################################################
# Service-specific Commands
###############################################################################

frontend: ## Start frontend service only (development mode without Docker)
	@echo "Starting frontend in development mode..."
	cd react-frontend && pnpm dev

backend: ## Start backend service only (development mode without Docker)
	@echo "Starting backend in development mode..."
	cd nest-backend && pnpm run start:dev

fast-detect-gpt: ## Start fast-detect-gpt service only (development mode without Docker)
	@echo "Starting fast-detect-gpt in development mode..."
	cd fast-detect-gpt && . .venv/bin/activate && python -m app.main

postgres: ## Start PostgreSQL only
	@echo "Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "✓ PostgreSQL started!"

###############################################################################
# Testing Commands
###############################################################################

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd react-frontend && pnpm test

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd nest-backend && pnpm test

###############################################################################
# Database Commands
###############################################################################

prisma-studio: ## Open Prisma Studio
	@echo "Opening Prisma Studio..."
	cd nest-backend && pnpm exec prisma studio

###############################################################################
# Development Commands
###############################################################################

dev: ## Start all services in development mode (without Docker)
	@echo "================================================"
	@echo "Starting development environment..."
	@echo "================================================"
	@echo "Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@echo "Running migrations..."
	cd nest-backend && pnpm exec prisma migrate dev
	@echo ""
	@echo "✓ Development environment ready!"
	@echo ""
	@echo "Run these commands in separate terminals:"
	@echo "  make frontend      - Frontend: http://localhost:5173"
	@echo "  make backend       - Backend: http://localhost:3333"
	@echo "  make fast-detect-gpt - Fast-Detect-GPT: http://localhost:8001"
