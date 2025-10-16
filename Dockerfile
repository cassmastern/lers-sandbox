FROM python:3.11-slim

WORKDIR /app

# Set environment variables early
ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV MKDOCS_WATCHDOG_USE_POLLING=true

# Install system dependencies (Graphviz CLI tools)
RUN apt-get update && \
    apt-get install -y graphviz && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt /app/

# Install Python dependencies including mkdocs-graphviz
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir mkdocs-graphviz

# Copy Mermaid JS explicitly
COPY docs/js/mermaid.min.js /app/docs/js/mermaid.min.js

# Copy the rest of the project
COPY . /app

EXPOSE 8000

CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]
