# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install MkDocs and Material theme
RUN pip install --no-cache-dir mkdocs mkdocs-material

# Copy your project files
COPY . .

# Expose port
EXPOSE 8000

# Serve the site
CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]
