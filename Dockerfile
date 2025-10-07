FROM python:3.11-slim

WORKDIR /app

# Set environment variables early (these rarely change)
ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV MKDOCS_WATCHDOG_USE_POLLING=true

# Install system dependencies (Graphviz)
RUN apt-get update && \
    apt-get install -y graphviz && \
    rm -rf /var/lib/apt/lists/*

# Copy only requirements first for better caching
COPY requirements.txt /app/

# Install dependencies in a separate layer
RUN pip install --no-cache-dir -r requirements.txt

# Copy Mermaid JS explicitly for reproducibility
COPY docs/js/mermaid.min.js /app/docs/js/mermaid.min.js

# Copy the rest of the application files
COPY . /app

EXPOSE 8000

CMD ["python", "-m", "mkdocs", "serve", "-a", "0.0.0.0:8000"]