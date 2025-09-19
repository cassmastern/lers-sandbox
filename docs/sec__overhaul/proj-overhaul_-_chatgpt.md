# ChatGPT - 1 - Accessible, Fast, and Secure MkDocs Material Setup

This document summarizes the recommended architecture, practices, and rationale for extending your MkDocs Material project with accessible diagrams, reproducible builds, and smooth CI/CD.

---

## 1. Core Principles

- **Accessibility First**: All diagrams and visuals pre-rendered into static SVG/PNG with `<title>`, `<desc>`, `role="img"`, `aria-labelledby`, and optional `tabindex` injected. Ensures WCAG compliance.
- **Reproducibility**: Pinned Python, NPM, and Docker versions. Build-time generation of diagrams (PlantUML, draw.io, Mermaid) ensures deterministic outputs.
- **Progressive Enhancement**: Client-side JS adds zoom, pan, and theme toggling **after** accessible defaults are in place. Enhancements never remove ARIA/keyboard support.
- **Observability & Security**: CI runs accessibility audits (pa11y, axe, Lighthouse) and dependency scans (`pip-audit`, `npm audit`, Trivy). Results surfaced in PR checks and artifacts.

---

## 2. Authoring Rules

- **Images/Diagrams**: Must use `![alt text](/img/generated/example.svg)` or frontmatter (`diagram_alt`, `diagram_longdesc`).
- **Long Descriptions**: Provide as HTML comments or frontmatter; build tooling injects into `<desc>` or hidden `<div>`.
- **Figure Semantics**: Prefer `<figure><img><figcaption>` for diagrams with captions.

---

## 3. Build & CI Pipeline

1. **Pre-render diagrams** into `docs/img/generated/` via Dockerized PlantUML/draw.io/Mermaid.
2. **Inject accessibility metadata** with a Python post-processor (`inject-svg-accessibility.py`).
3. **Check references**: `check-references.sh` fails build if `alt`/files missing.
4. **Run accessibility tests**: pa11y-ci, axe-core, Lighthouse CI.
5. **Run security scans**: `pip-audit`, `npm audit`, Trivy.
6. **Build site**: `mkdocs build -d site`.
7. **Deploy**: GitHub Pages or nginx-alpine container.

---

## 4. Runtime Practices

- **Inline SVGs** with CSS variables for theme adaptation (best, no flicker).
- **Toolbar Controls**: Accessible zoom/pan buttons with `aria-controls`, keyboard handlers, and `aria-describedby` linking to long description.
- **Theme Toggle**: Either inline CSS-variable SVGs or pre-render light/dark variants; avoid raw re-renders.

---

## 5. Refactoring Structure

- `assets/js/src/` and `assets/css/src/` → bundled with npm into `docs/js/app.min.js` and `docs/css/app.min.css`.
- Replace multiple `extra_javascript`/`extra_css` with bundles.
- JS modules expose `init()`; orchestrator calls them on Material’s navigation events.

---

## 6. File Layout

```
docs/
  index.md
  ibm-sanfran.md
  js/ css/              # production bundles
  img/generated/        # rendered SVG/PNG
tools/
  diagram-render/       # shell scripts for PlantUML/draw.io/Mermaid
  inject-svg-accessibility.py
assets/
  js/src/ css/src/      # source files
.github/workflows/
  deploy.yml            # CI/CD pipeline
```

---

## 7. Benefits

- **WCAG Compliance**: alt/desc enforced at build, tested at CI.
- **Performance**: pre-rendered diagrams served statically; reduced client JS weight.
- **Cross-Platform**: Dockerized renderers and `docker-compose.dev.yml` unify macOS/Linux development.
- **Security**: pinned dependencies, vulnerability scans.
- **Future-Proof**: clear separation of authoring, build, runtime layers; easy to extend.

---

## 8. Next Steps

1. Add `tools/diagram-render/` scripts and run locally.
2. Add `inject-svg-accessibility.py` and confirm metadata injection.
3. Add Makefile targets (`render`, `inject`, `build`, `test`, `deploy`).
4. Update CI workflow to enforce accessibility + security gates.
5. Refactor JS/CSS into bundles and replace in `mkdocs.yml`.
6. Convert key diagrams to inline SVGs with CSS-variable colors.

---

## Addendum

After reading 2 alternative reports:

### Improved recommendations after examining both

Here’s the **merged master plan** (additions in **bold** ):

1. **Diagram pipeline**
   * Pre-render PlantUML, Mermaid, Draw.io → static SVGs.
   * **Add a metadata registry (YAML/JSON)** with IDs, alt text, desc, provenance.
   * Run Python accessibility patcher to inject `<title>`, `<desc>`, `role`, `aria-labelledby`.
2. **Runtime code**
   * Refactor JS into modular files (`themeSwitcher.js`, `diagramManager.js`, `zoomHandler.js`).
   * Add a central orchestrator (`app-core.js`) to prevent race conditions.
   * **Use MutationObserver** to reapply accessibility after theme toggles.
3. **Build & CI/CD**
   * Replace multiple raw JS/CSS files with bundled/minified assets.
   * Add CI pipeline stages: render → inject → build → accessibility tests (Pa11y, Axe) → **performance tests (Lighthouse CI)** → deploy.
   * **Introduce performance budgets** (e.g., bundle <90KB, theme switch <50ms).
4. **Editorial discipline**
   * **Maintain a diagram metadata registry and changelog** documenting accessibility, provenance, and editorial updates.
   * Require alt text and longdesc in the registry for every new diagram.
5. **Cross-platform dev**
   * Dockerized dev with `docker-compose.dev.yml`.
   * CI matrix: test on macOS and Linux runners.
