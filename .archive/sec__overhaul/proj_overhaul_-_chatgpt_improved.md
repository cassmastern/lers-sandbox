# ChatGPT - 2 - Improved - Improved recommendations after examining both

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
