.PHONY: help install build up down clean restart logs frontend backend fast-detect-gpt postgres

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for all services
	@echo "Installing frontend dependencies..."
	cd react-frontend && pnpm install
	@echo "Installing backend dependencies..."
	cd nest-backend && pnpm install
	@echo "Setting up Prisma..."
	cd nest-backend && pnpm exec prisma generate
	@echo "Installing fast-detect-gpt dependencies..."
	cd fast-detect-gpt && uv venv && . .venv/bin/activate && uv pip install -r requirements.txt

build: ## Build all Docker containers
	docker compose build

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

clean: ## Stop services and remove volumes
	docker compose down -v
	rm -rf postgres_data

restart: ## Restart all services
	docker compose restart

logs: ## Show logs for all services
	docker compose logs -f

frontend: ## Start frontend service only
	cd react-frontend && pnpm dev

backend: ## Start backend service only
	cd nest-backend && pnpm run start:dev

fast-detect-gpt: ## Start fast-detect-gpt service only
	cd fast-detect-gpt && . .venv/bin/activate && python -m app.main

postgres: ## Start PostgreSQL only
	docker compose up -d postgres

migrate: ## Run Prisma migrations
	cd nest-backend && pnpm exec prisma migrate dev

prisma-studio: ## Open Prisma Studio
	cd nest-backend && pnpm exec prisma studio

test-frontend: ## Run frontend tests
	cd react-frontend && pnpm test

test-backend: ## Run backend tests
	cd nest-backend && pnpm test

dev: ## Start all services in development mode (without Docker)
	@echo "Starting PostgreSQL..."
	docker compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@echo "Running migrations..."
	cd nest-backend && pnpm exec prisma migrate dev
	@echo "Starting services..."
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3333"
	@echo "Fast-Detect-GPT: http://localhost:8001"
	@echo ""
	@echo "Run 'make frontend', 'make backend', and 'make fast-detect-gpt' in separate terminals"
