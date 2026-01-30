# POC AI Detector - Remastered

AI-generated content detection project using multiple detection methods.

## Project Structure

```
.
├── react-frontend/      # React + Vite + TailwindCSS frontend
├── nest-backend/        # NestJS + Prisma backend
├── fast-detect-gpt/     # Flask-based Fast Detect GPT service
├── docker-compose.yml   # Docker Compose configuration
└── Makefile            # Project automation commands
```

## Technology Stack

### Frontend (react-frontend)
- **Framework**: React 19 with Vite 7
- **Styling**: TailwindCSS 4
- **Routing**: React Router DOM 7
- **UI Components**: @iconify/react for icons
- **Notifications**: toastify-js
- **Validation**: Yup
- **Testing**: Vitest

### Backend (nest-backend)
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: @nestjs/jwt, @nestjs/passport, passport-jwt
- **Password Hashing**: bcrypt
- **Queue Management**: @nestjs/bull, bull
- **Testing**: Jest (comes with NestJS)

### Fast Detect GPT Service (fast-detect-gpt)
- **Framework**: Flask
- **Environment Management**: uv
- **Dependencies**: pyproject.toml with hashed requirements.txt
- **ML Libraries**: PyTorch, Transformers, Datasets
- **Deployment**: CUDA-enabled Docker container

### Database
- **PostgreSQL 13**: Running in Docker container

## Prerequisites

- Node.js 20+
- pnpm
- Python 3.11
- uv (Python package manager)
- Docker and Docker Compose
- NVIDIA GPU with CUDA support (for fast-detect-gpt)

## Quick Start

### 1. Install Dependencies

```bash
make install
```

This will:
- Install frontend dependencies with pnpm
- Install backend dependencies with pnpm
- Generate Prisma client
- Set up Python virtual environment and install dependencies

### 2. Start Services

#### Option A: All services with Docker

```bash
make build  # Build Docker images
make up     # Start all services
```

#### Option B: Development mode (without Docker)

```bash
make dev    # Starts PostgreSQL in Docker
```

Then in separate terminals:

```bash
make frontend        # Start React frontend on http://localhost:5173
make backend         # Start NestJS backend on http://localhost:3333
make fast-detect-gpt # Start Flask service on http://localhost:8001
```

### 3. Database Migrations

```bash
make migrate       # Run Prisma migrations
make prisma-studio # Open Prisma Studio GUI
```

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install dependencies for all services |
| `make build` | Build all Docker containers |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make clean` | Stop services and remove volumes |
| `make restart` | Restart all services |
| `make logs` | Show logs for all services |
| `make frontend` | Start frontend service only |
| `make backend` | Start backend service only |
| `make fast-detect-gpt` | Start fast-detect-gpt service only |
| `make postgres` | Start PostgreSQL only |
| `make migrate` | Run Prisma migrations |
| `make prisma-studio` | Open Prisma Studio |
| `make test-frontend` | Run frontend tests |
| `make test-backend` | Run backend tests |
| `make dev` | Start services in development mode |

## Service URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3333
- **Fast Detect GPT**: http://localhost:8001
- **PostgreSQL**: localhost:5432

## Environment Variables

Configure the following in `nest-backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/pocaidb?schema=public"
JWT_SECRET="your-jwt-secret-key-change-in-production"
PORT=3333
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pocaidb
```

## Fast Detect GPT API

### Endpoints

#### POST `/fast-detect-gpt/detect`
Analyze text for AI-generated content.

**Request:**
```json
{
  "text": "Text to analyze"
}
```

**Response:**
```json
{
  "score": 0.85,
  "is_ai_generated": true
}
```

#### GET `/fast-detect-gpt/detect`
Check GPU availability and system status.

**Response:**
```json
{
  "cuda_available": true,
  "cuda_device_count": 1,
  "cuda_current_device": 0,
  "cuda_device_name": "NVIDIA GeForce RTX 3080"
}
```

## Development Notes

### Fast Detect GPT Migration
The Fast Detect GPT service was migrated from Django to Flask while maintaining the original REST API logic. Key changes:
- Replaced Django REST Framework with Flask
- Implemented uv for Python environment management
- Configured pyproject.toml for dependency management
- Generated hashed requirements.txt using pip-compile for security
- Maintained compatibility with existing inference scripts

### Frontend
- Uses Vite for fast development and optimized production builds
- TailwindCSS 4 for utility-first styling
- Configured with PostCSS for CSS processing

### Backend
- Follows NestJS best practices with modular architecture
- Prisma for type-safe database access
- JWT-based authentication ready for implementation
- Bull queue for background job processing

## Testing

```bash
# Frontend tests
make test-frontend

# Backend tests
make test-backend
```

## Production Deployment

1. Update environment variables for production
2. Build Docker images: `make build`
3. Deploy using Docker Compose or Kubernetes
4. Ensure NVIDIA GPU drivers are installed for fast-detect-gpt

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure PostgreSQL container is running: `docker ps`
- Check logs: `make logs`
- Verify environment variables in `nest-backend/.env`

### Frontend Not Loading
- Check if port 5173 is available
- Verify Node.js version: `node --version` (should be 20+)
- Clear node_modules and reinstall: `cd react-frontend && rm -rf node_modules && pnpm install`

### Fast Detect GPT GPU Issues
- Verify NVIDIA drivers: `nvidia-smi`
- Check CUDA availability in container
- Ensure Docker has GPU support enabled

## License

See individual service directories for license information.

## User Story Implementation

This project implements **US-000: Initialize Project Structure** with the following acceptance criteria:

✅ Frontend project initialized with React + Vite + TailwindCSS  
✅ Backend project initialized with NestJS + Prisma  
✅ Fast Detect GPT service structure is set with UV, pyproject.toml, hashed requirements.txt and Flask  
✅ PostgreSQL database is configured  
✅ All three services can run independently  
✅ Project follows monorepo structure  
