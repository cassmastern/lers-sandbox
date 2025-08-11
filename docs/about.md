# How This Site Was Developed and Deployed  

Well, basically, I had a project back in 2021 conceived as a flirt with the concepts of cloud, CI/CD, Docker, and GitHub Actions, and I chose the subject matter to be Docker and kubectl. For this, August 2025 demo, I 'containerized' the dynamic (development) layer and created topics dedicated to Azure Cloud and Azure DevOps. In addition, tweaked the layout, enhanced content navigation, and had ample opportunity to play with various build/version control/deploy/publish/monitor/etc — features, constructs, mechanisms and bugs. Thanks.


## Architecture Overview  

The site is deployed using a hybrid static-dynamic architecture, containerized with Docker and served via Azure. It is built with MkDocs, a Python-based static site generator/platform and enhanced with Mermaid.js for diagram rendering.

### Static Site Layer  

- **Framework**: MkDocs with Material theme
- **Content**: Markdown-based documentation rendered into static HTML/CSS/JS
- **Build Process**: Dockerized using a reproducible pipeline with `requirements.txt`
- **Serving Method**: Static assets deployed to Azure CDN or Blob Storage

### Dynamic Layer  

- **Development Server**: MkDocs live reload enabled via polling-based file watcher
- **Environment Variable**: `MKDOCS_WATCHDOG_USE_POLLING=true` set in Dockerfile
- **Live Preview**: Served via `mkdocs serve` inside Docker container
- **Plugin Support**: `mkdocs-mermaid2-plugin` installed and configured for diagram rendering
- **Enhancements and Customizations**: Custom JS/CSS for
    - 'Hijacking' the native TOC at the right-hand sidebar in alphabetically ordered glossaries and replacing it with a vertical hypertext alphabet to navigate comfortably
     - Spotlight JS to enhance diagrams with overlays/zoom capability (not working \[yet])

### Docker Environment 

```Dockerfile
ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV MKDOCS_WATCHDOG_USE_POLLING=true
```

- All dependencies installed via requirements.txt
- Clean build logs with suppressed pip notices
- Container exposes port 8000 for local development

### CI/CD Pipeline (Azure DevOps)  

- **Build stage**: Docker image builds for static site and backend container
- **Test stage**: Markdown linting, link checks, container health checks
- **Deployment stage**: Parallel jobs deploy static assets and backend services
- **Monitoring stage**: Azure Application Insights and container logs for observability

### Deployoment Flow  

```mermaid
graph TD
    subgraph DevMachine [Developer Machine]
        MkDocs[MkDocs + Docker]
    end

    GitHub[GitHub Repository]

    subgraph AzureDevOps [Azure DevOps]
        CI[CI Pipeline]
        Jobs[Parallel Jobs]
    end

    subgraph Azure [Azure Cloud]
        subgraph StaticHosting [Static Hosting]
            StaticSite[Static Site]
        end
        subgraph AppService [App Service]
            BackendAPI[Backend API]
        end
    end

    Browser[User Browser]

    MkDocs -->|commit & push| GitHub
    GitHub -->|triggers build| CI
    CI -->|runs pipeline| Jobs
    Jobs -->|deploy static assets| StaticSite
    Jobs -->|deploy backend container| BackendAPI
    StaticSite -->|serve docs| Browser
    BackendAPI -->|serve dynamic endpoints| Browser
```
## Pros

- Cross-platform reproducibility via Docker
- Modular architecture: decoupled frontend/backend
- CI/CD automation and security-first mindset

## Future Enhancements (next phase)  

- **Auth Gate**: Azure AD B2C or custom JWT-based login
- **Audit Logging**: Azure Monitor or Application Insights
- **Secrets Management**: Azure Key Vault
- **Backend Extensibility**: Modular API endpoints, possibly containerized
- **Role-based Access**: For editing, viewing, or admin tasks
- **CI/CD Enhancements**: Parallel jobs, conditional stages, test coverage
- **.JS/CSS enhancements**: Perhaps consider, for 'pure' glossaries, making the "active letter highlight" stick until the user scrolls past to the next letter. (Right now, it only changes once the next letter’s row reaches the top of the view.)