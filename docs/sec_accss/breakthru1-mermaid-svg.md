# Breakthrough #1, Meaning in Mermaid SVGs

OK, this is about embedding accessible Mermaid diagrams in MkDocs Material. Or rather, *embedding Mermaid code, with meaning embedded in it, in MkDocs Markdown source files*. I finally figured out I didn't need any custom scripts or post-processing hacks — at least not at this point — for metadata injection. Mermaid supports at least *some* accessibility features 🤦🏻‍♂️ — just enough for my current purposes! I just didn't know how to make use of them...

So, before I forget, let me put together a report to and for myself.

The breakthrough (yes, a real one for a non-programmer like myself) came from using Mermaid’s built-in support for `accTitle` and `accDescr` directly inside fenced code blocks: Here’s an example of what I now include in my Markdown source:

```text
flowchart TB
    accTitle: IBM SanFrancisco Layered Architecture
    accDescr: Diagram showing IBM SanFrancisco's layered architecture. 
    Arrows connect layers from top to bottom: User Interface → Business 
    Logic → Foundation Services → JVM → Operating System. SanFrancisco 
    encompasses the Business Logic and Foundation layers, positioned 
    between application code and the JVM.
  
    UI[User Interface Layer] --> BL[Business Logic Layer]
    BL --> FS[Foundation Services Layer]
    FS --> JVM[Java Virtual Machine]
    JVM --> OS[Operating System]
    subgraph IBM_SanFrancisco["IBM SanFrancisco"]
        BL
        FS
    end
```

This metadata is now rendered into the final SVG as `title>`and `desc>` elements, and correctly referenced via `aria-labelledby` and `aria-describedby`.
(Firefox's `Inspect Accessibility Properties` tool confirms the diagram is exposed to assistive technologies with the correct role (`graphics-document`) and semantic description.

**To Make this Work:**

1. `curl` a compatible Mermaid version, 10.9.1, from  (https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js)[https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js]
2. Save it in the project: `/docs/js/mermaid.min.js`.
3. Ensure the script is copied to the Docker image (so it's available at runtime).
4. Update the project's `mkdocs.yml` file to explicitly reference the local script under the `mermaid2` plugin configuration:

   ```yaml
   plugins:
   - search
   - mermaid2:
       javascript: js/mermaid.min.js
   - awesome-pages
   ```

This setup allows to maintain:

- editorial control
- version pinning
- reproducibility across builds

It also aligns with my changelog-driven workflow and accessibility goals, giving me a clean way to document semantic diagrams without compromising on compliance.

> **Next steps**:
>
> - test keyboard focus, zoom behavior, and theme-adaptive contrast
> - perhaps wrap diagrams in `<figure>` blocks or add `tabindex="0"` if needed
> - most importantly, collect all `<!--ALT` and `<!--DESC` blurbs, with which I had punctuated my source markdown (just before Mermaid diagrams, intending to script them into a custom JS injector to use), and populate them as embedded `accTitle` and `accDescr` values in Mermaid diagram blocks