FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV MKDOCS_WATCHDOG_USE_POLLING=true

# Copy and install requirements first (best caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
# simpler and avoids missing directory errors
COPY . .

EXPOSE 8000

CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]