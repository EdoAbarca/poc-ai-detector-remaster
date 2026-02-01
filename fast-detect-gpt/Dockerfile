# Multi-stage build for optimized Flask API with GPU support
# Base stage with CUDA and Python
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04 AS base

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install Python 3.11 and minimal dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-venv \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1 && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1

# Install UV for fast package management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
ENV PATH="/root/.local/bin:${PATH}"

WORKDIR /app

# Copy dependency files
COPY pyproject.toml requirements.txt ./

# Install dependencies using UV (faster than pip)
RUN uv pip install --system -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create necessary directories
RUN mkdir -p offload cache

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Expose port
EXPOSE 8001

# Set environment (override with docker run -e ENVIRONMENT=production)
ENV ENVIRONMENT=development

# Run Flask application
CMD ["python3", "-m", "app.main"]

# Production stage (optimized)
FROM base AS production

WORKDIR /app

# Copy dependency files
COPY pyproject.toml requirements.txt ./

# Install dependencies using UV (faster than pip)
RUN uv pip install --system -r requirements.txt

# Copy only application code (no development files)
COPY app/ ./app/

# Create necessary directories
RUN mkdir -p offload cache

# Remove unnecessary files to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Expose port
EXPOSE 8001

# Set environment
ENV ENVIRONMENT=production

# Run Flask application with production settings
CMD ["python3", "-m", "app.main"]
