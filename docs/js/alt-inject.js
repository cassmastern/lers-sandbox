document.addEventListener("DOMContentLoaded", () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null, false);
  let comment;
  let pendingAlt = null;
  let pendingDesc = null;
  let counter = 0;

  while ((comment = walker.nextNode())) {
    const text = comment.textContent.trim();
    const altMatch = text.match(/^ALT:\s*(.+)$/);
    const descMatch = text.match(/^DESC:\s*(.+)$/);

    if (altMatch) {
      pendingAlt = altMatch[1];
    }
    if (descMatch) {
      pendingDesc = descMatch[1];
    }

    // If we have either ALT or DESC, look ahead for the next Mermaid diagram
    if (pendingAlt || pendingDesc) {
      let next = comment.nextSibling;
      while (next && !(next.nodeType === Node.ELEMENT_NODE && next.matches("div.mermaid"))) {
        next = next.nextSibling;
      }

      if (next) {
        const svg = next.querySelector("svg");
        if (svg) {
          const titleId = `mermaid-title-${counter++}`;
          const descId = `mermaid-desc-${counter++}`;

          if (pendingAlt) {
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.setAttribute("id", titleId);
            title.textContent = pendingAlt;
            svg.insertBefore(title, svg.firstChild);
          }

          if (pendingDesc) {
            const desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
            desc.setAttribute("id", descId);
            desc.textContent = pendingDesc;
            svg.insertBefore(desc, svg.firstChild);
          }

          svg.setAttribute("role", "img");
          svg.setAttribute("focusable", "false");
          svg.setAttribute("tabindex", "-1");

          // Prefer aria-labelledby if both are present
          if (pendingAlt && pendingDesc) {
            svg.setAttribute("aria-labelledby", `${titleId} ${descId}`);
          } else if (pendingAlt) {
            svg.setAttribute("aria-labelledby", titleId);
          } else if (pendingDesc) {
            svg.setAttribute("aria-labelledby", descId);
          }

          console.debug("Injected SVG metadata:", { alt: pendingAlt, desc: pendingDesc });
        }

        // Reset after injection
        pendingAlt = null;
        pendingDesc = null;
      }
    }
  }
});
