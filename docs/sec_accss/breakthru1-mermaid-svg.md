# An Accessible Mermaid Beyond Reach — A Breakthrough That Wasn't

OK, some more about embedding accessible Mermaid diagrams in MkDocs Material. Or rather, *embedding Mermaid code, with some meaning embedded in it, in MkDocs Markdown source files*.

Finally figured out I didn't need any custom scripts or post-processing hacks — at least not at this point — for metadata injection. Turns out — RTFM, eh 🤦🏻‍♂️ — I can use Mermaid’s built-in support for `accTitle` and `accDescr` directly inside fenced code blocks:

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

I just had to find and pin a compatible combination of component versions:

- MkDocs 1.6.1
- MkDocs Material 9.5.39
- mkdocs-mermaid2-plugin 1.2.1
- Mermaid library mermaid@10.9.1 ([https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js](https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js))

So, accTitle and accDescr metadata are now rendered into the final SVG as `title>`and `<desc>` elements, and correctly referenced via `aria-labelledby` and `aria-describedby`.
(Firefox's `Inspect Accessibility Properties` tool confirms the diagram is exposed with the role (`graphics-document`) and semantic description.)

## However...

However, VoiceOver (macOS) and other common screen readers announce only the visible text labels inside the diagram (the <text> elements for nodes), and do not read the `<title>` / `<desc>` reliably 🤦‍♂️.

To get assistive technologies to treat and announce the SVG as a **single image** with name/description, I also need `role="img"` (NOT mermaid's `role="graphics-document document"`) and `tabindex="0"`. Otherwise, VoiceOver and other utilities treat the SVG as *collection if images*, announcing every box label one after the other. No sense.

Attempting to patch the SVGs post-render (to add `role="img"` + `tabindex="0"` to `svg[id^="mermaid-"]`), fail miserably.

So, yes. An *accessible mermaid, but beyond reach* indeed...

![An accessible mermaid beyond reach.](../img/mermaid-beyond-reach.png)

The journey continues...

## To Do to Move Forward

- Find a way and a mechanism to override Mermaid’s default rendering behavior and modify the SVG output **before** it’s inserted into the DOM,
    -or-
- Find a way and a mechanism to patch SVGs post-build.

Something like

```js
  postRender: (svgCode, bindFunctions) => {
    // Add role="img" and tabindex="0" to the root <svg> element
    const svg = svgCode.replace(/<svg/, '<svg role="img" tabindex="0"');
    return svg;
  }
});
```
