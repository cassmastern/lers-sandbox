# MkDocs Material 

A modular, Dockerized documentation site built with MkDocs Material. Designed as a playground for CICD and accessibility (AODA/WCAG) features, and, hopefully, as a showcase.

## Features

- Static site via GitHub Pages
- Dockerized build with live preview
- Mermaid.js diagrams
- Custom JS/CSS for glossary navigation
- Accessibility scripts: alt-text injection, skip links, ARIA toggles, keyboard nav
- CI/CD pipeline: linting, link checks, deployment via GitHub Actions

## Setup

```bash
docker build -t <your_project_name> .
docker run -p 8000:8000 <your_project_name>
```
