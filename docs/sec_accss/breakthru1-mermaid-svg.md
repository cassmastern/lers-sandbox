# An Accessible Mermaid Beyond Reach — A Breakthrough That Wasn't

OK, some more about embedding accessible Mermaid diagrams in MkDocs Material. Or rather, *embedding Mermaid code, with some meaning embedded in it, in MkDocs Markdown source files*.

Finally figured out I didn't need any custom scripts or post-processing hacks — at least not at this point — for metadata injection. Turns out, I can use Mermaid’s built-in support for `accTitle` and `accDescr` directly inside fenced code blocks:

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

I just had to find a compatible combination of component versions:

- MkDocs 1.6.1
- MkDocs Material 9.5.39
- mkdocs-mermaid2-plugin 1.2.1
- Mermaid library mermaid@10.9.1 ([https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js](https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js))

So, accTitle and accDescr metadata are now rendered into the final SVG as `title>`and `desc>` elements, and correctly referenced via `aria-labelledby` and `aria-describedby`.
(Firefox's `Inspect Accessibility Properties` tool confirms the diagram is exposed with the correct role (`graphics-document`) and semantic description.)

## However...

However, VoiceOver (macOS) and other common screen readers frequently announce only the visible text labels inside the diagram (the <text> elements for nodes), and do not read the `<title>` / `<desc>` reliably 🤦‍♂️

To get assistive technologies to treat and announce the SVG as a **single image** with name/description, I also need `role="img"` (NOT mermaid's `role="graphics-document document"`) and `tabindex="0"`. Otherwise, they, in my case VoiceOver, treats the SVG as collection if images, announcing every box one after the other. No sense.

Attempting to patch the SVGs post-render (to add `role="img"` + `tabindex="0"` to `svg[id^="mermaid-"]`), fail miserably.

![An almost-accessible mermaid beyond reach.](../img/mermaid-beyond-reach.png)

The journey continues...
