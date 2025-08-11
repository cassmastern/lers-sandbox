# 🚀 MkDocs Material Deployment to Azure Blob Storage (Public Access)

This guide walks through deploying a static MkDocs site to Azure Blob Storage for temporary public access—ideal for interviews or short-term sharing.

---

## 🧱 Prerequisites

- Azure CLI installed and logged in (`az login`)
- Docker installed
- MkDocs Material project ready
- Azure subscription active

---

## 🛠️ Step-by-Step Deployment

### 1. **Build the MkDocs Site**

```bash
docker run --rm -v "$PWD":/app squidfunk/mkdocs-material mkdocs build --clean
```

Output will be in the `site/` directory.

### 2. Create Storage Account

```bash
az storage account create \
  --name <yourStorageAccount> \
  --resource-group <yourResourceGroup> \
  --location canadacentral \
  --sku Standard_LRS
```

### 3. Enable Static Website Hosting

```bash
az storage blob service-properties update
--account-name <yourStorageAccount>
--static-website
--index-document index.html
--error-document 404.html
```

### 4. Upload Site Files

```bash
az storage blob upload-batch \
  --destination '$web' \
  --source 'site' \
  --account-name <yourStorageAccount>
```

### 5. Access Your Site

Visit:

`https://<yourStorageAccount>.z13.web.core.windows.net/`

Share this link with interviewers. No login required.

## Cleanup (When Done)

```bash
az storage account delete \
  --name <yourStorageAccount> \
  --resource-group <yourResourceGroup>
```
Or disable static website hosting and delete the `$web` container.

## Notes
- First 5 GB/month outbound data is free
- Storage cost for small sites is negligible
- No custom domain or CDN needed for regional access
- **ToDo**: Style this guide for inclusion in the MKdocs site? Or CI pipeline? If yesAdd diagrams or glossary links? if you’re prepping it for interviews.
