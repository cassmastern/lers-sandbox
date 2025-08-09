FROM python:3.11-slim

WORKDIR /app

COPY . /app

ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV MKDOCS_WATCHDOG_USE_POLLING=true

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["mkdocs", "serve", "-a", "0.0.0.0:8000"]
