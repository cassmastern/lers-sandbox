# ⚙️ Azure DevOps Automation Cheat Sheet for MkDocs

Automating the MkDocs site build and deployment using Azure Pipelines.

---

## Prerequisites

- The MkDocs project is in a GitHub repo
- Contains:
  - `mkdocs.yml`
  - `docs/` folder
  - Optional: `Dockerfile` if using Docker builds

---

## Create Azure Pipeline

Add this file to repo root:

### `azure-pipelines.yml`

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: UsePythonVersion@0
  inputs:
    versionSpec: '3.x'
    addToPath: true

- script: |
    pip install mkdocs mkdocs-material
    mkdocs build
  displayName: 'Build MkDocs Site'

- task: PublishBuildArtifacts@1
  inputs:
    pathToPublish: 'site'
    artifactName: 'mkdocs-site'
```

---

## Optional Deployment: GitHub Pages

Add this step to push the built site to GitHub Pages:

```yaml
- script: |
    pip install ghp-import
    ghp-import -n -p -f site
  displayName: 'Deploy to GitHub Pages'
```

Make sure the repo has GitHub Pages enabled (e.g. from `gh-pages` branch).

---

## Test Locally Before Committing

```bash
mkdocs build
ghp-import -n -p -f site
```

---

## Secure the Pipeline

- Use Azure DevOps **Service Connections** to authenticate with GitHub
- Store secrets (like tokens) in **Azure Pipeline Variables**

---

## Notes

- This pipeline can be extended to use Docker builds or deploy to Azure Static Web Apps
- For Docker-based builds, replace the `pip install` step with a `docker build` and `docker run` sequence

---

## 📚 Resources

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Azure Pipelines Docs](https://learn.microsoft.com/en-us/azure/devops/pipelines/)
- [ghp-import Tool](https://github.com/c-w/ghp-import)
