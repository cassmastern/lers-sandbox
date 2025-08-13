FROM python:3.11-slim

WORKDIR /app

# Set environment variables early (these rarely change)
ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV MKDOCS_WATCHDOG_USE_POLLING=true

# Copy only requirements first for better caching
COPY requirements.txt /app/

# Install dependencies in a separate layer
# This layer will only rebuild if requirements.txt changes
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
# This layer will rebuild when docs/config changes, but deps stay cached
COPY . /app

EXPOSE 8000

CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]