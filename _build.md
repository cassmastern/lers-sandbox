# Build commands and MD snippets cheatsheet 

## Build cheatsheet

### Build static site (renders to /site)

```bash
docker run --rm -v "$(pwd)":/app mkdocs-site mkdocs build --verbose && touch site/.nojekyll
```
### Preview built site locally with Python http.server

[while in `/site`]:

```bash
python3 -m http.server 8000
```

### Live Preview (no /site output)

```bash
docker run --rm -p 8000:8000 -v "$(pwd)":/app mkdocs-site mkdocs serve --dev-addr=0.0.0.0:8000 --livereload
```


## Aliases
```zsh
alias cassbuild='docker build -t mkdocs-site .'
alias casssite='docker run --rm -v "$(pwd)":/app mkdocs-site mkdocs build --verbose && touch site/.nojekyll'
alias cassserve='docker run --rm -p 8000:8000 -v "$(pwd)":/app mkdocs-site mkdocs serve --dev-addr=0.0.0.0:8000 --livereload'
alias pumlpull='docker pull plantuml/plantuml-server'
alias pumlrun='docker run -d -p 8080:8080 plantuml/plantuml-server'
```

## vscodium snippets

### A11y

<details>
<summary><strong>mma11y — Mermaid A11y Block</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `mmally` |
| **Body**   | <pre>    accTitle: ${1:Mermaid diagram title}\n    accDescr: ${2:Mermaid diagram description}</pre> |
| **Description** | Insert Mermaid diagram metadata block (accTitle/accDescr), indented by 4 spaces |

</details>

<details>
<summary><strong>pga11y — PUML/Graphviz A11y Comment</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `pgallyy` |
| **Body**   | <pre>&lt;!-- diagram-a11y: title="${1:Your diagram title}" desc="${2:Your diagram description}" --&gt;$0</pre> |
| **Description** | Insert HTML comment for PUML/Graphviz diagram accessibility |

</details>

### Markdown extensions
<details>
<summary><strong>mtip — Tip Admonition</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `mtip` |
| **Body**   | <pre>!!! tip "Pro Tip"\n    Remember to always save your work!</pre> |
| **Description** | Insert MkDocs Material tip admonition |

</details>

<details>
<summary><strong>mdanger — Danger Admonition</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `mdanger` |
| **Body**   | <pre>!!! danger\n    This action cannot be undone. Proceed with caution.</pre> |
| **Description** | Insert MkDocs Material danger admonition |

</details>

<details>
<summary><strong>mexample — Example Admonition</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `mexample` |
| **Body**   | <pre>!!! example "Code Example"\n    ```python\n    print("Hello, Admonitions!")\n    ```</pre> |
| **Description** | Insert MkDocs Material example admonition |

</details>

<details>
<summary><strong>mnote — Note Admonition</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `mnote` |
| **Body**   | <pre>!!! note "Main Topic"\n    This is the main content.</pre> |
| **Description** | Insert MkDocs Material note admonition |

</details>

<details>
<summary><strong>msubwarn — Warning Sub-Admonition</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `msubwarn` |
| **Body**   | <pre>    !!! warning "Important Sub-point"\n        Don't forget this crucial detail within the main topic.</pre> |
| **Description** | Insert nested warning inside another admonition |

</details>

<details>
<summary><strong>minline — Inline Admonition (Fixed)</strong></summary>

| Field       | Value |
|------------|-------|
| **Prefix** | `minline` |
| **Body**   | <pre>{% raw %}[:material-information-outline: **Info:**]{ .md-inline } ${1:This is an inline info block.}{% endraw %}</pre> |
| **Description** | Insert inline info block (MkDocs Material workaround) |

</details>
