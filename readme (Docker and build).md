# Docker Cheatsheet for MkDocs Projects

This guide covers essential Docker commands for building, troubleshooting, and serving the MkDocs site.

---

## Build Docker Image

Build the image from the Dockerfile (must be in the root directory):

```bash
docker build -t mkdocs-site .
```

- `-t mkdocs-site`: Tags the image for easy reference
- `.`: Builds from current directory

---

## Serve MkDocs Site with Live Reload

Run the container and serve the site with live reload enabled:

```bash
docker run --rm -p 8000:8000 -v "$PWD":/app mkdocs-site mkdocs serve --dev-addr=0.0.0.0:8000 --livereload
```
or, with a descriptive name ("mkdocs-dev") 

```bash
docker run --rm --name mkdocs-dev -p 8000:8000 -v "$PWD":/app mkdocs-site mkdocs serve --dev-addr=0.0.0.0:8000 --livereload
```

- `--rm`: Removes container after exit  
- `-p 8000:8000`: Maps container port to host  
- `-v "$PWD":/app`: Mounts current directory into container  
- `--livereload`: Enables automatic browser refresh on file changes  

Access the site at: [http://localhost:8000](http://localhost:8000) (on some machines it's [http://0.0.0.0:8000](http://0.0.0.0:8000)).

---

## Troubleshooting Tips

### Rebuild Image (if dependencies change)

```bash
docker build --no-cache -t mkdocs-site .
```

### Remove Dangling Images

```bash
docker image prune
```

### List Running Containers

```bash
docker ps
```

### Stop a Running Container

```bash
docker stop <container_id>
```

### Enter a Running Container (for debugging)

```bash
docker exec -it <container_id> /bin/sh
```
---------------------------------

### List all images

```bash
$ docker image ls
```
### Remove dangling images (untagged and unused images)

```bash
$ docker image prune -f
```
### Remove all unused images forcefully and without prompt

```bash
$ docker image prune -a -f
```
## Volume Mounting Notes

Ensure the project folder contains:
- `mkdocs.yml`
- `docs/` directory with markdown files

Changes to these files will trigger live reload if mounted correctly.

---

## Test Static Build

Generate the static site without serving:

```bash
docker run --rm -v "$PWD":/app mkdocs-site mkdocs build
```

Output will be in the `site/` folder.

---

## Clean Up Docker System (Optional)

```bash
docker system prune -a
```

This removes all unused containers, images, and networks.

---

## Notes

- Always rebuild the image if/when dependencies change in `requirements.txt` or the Dockerfile.
- For multi-machine setups, commit the `Dockerfile` and rebuild locally, or push the image to a registry.
