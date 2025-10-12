FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including Azure CLI
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    curl \
    bash \
    && curl -sL https://aka.ms/InstallAzureCLIDeb | bash \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8006

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8006/health', timeout=5)" || exit 1

# Run the server
CMD ["python", "server.py"]
