// Simple ALT comment processor for AODA compliance
// scripts/js/alt-processor.js

document.addEventListener("DOMContentLoaded", () => {
  // Find all HTML comments containing ALT: descriptions
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_COMMENT,
    null,
    false
  );

  const altComments = [];
  while (walker.nextNode()) {
    const comment = walker.currentNode;
    const match = comment.nodeValue.trim().match(/^ALT:\s*(.+)$/);
    if (match) {
      altComments.push({ node: comment, text: match[1] });
    }
  }

  // Process each ALT comment
  altComments.forEach(({ node, text }) => {
    // Find the next mermaid diagram
    let next = node.nextSibling;
    while (next && !(next.nodeType === 1 && next.classList?.contains("mermaid"))) {
      next = next.nextSibling;
    }

    if (next) {
      // Wait for mermaid to render, then add accessibility attributes
      const checkForSvg = () => {
        const svg = next.querySelector("svg");
        if (svg) {
          // Add ARIA label for screen readers
          svg.setAttribute("role", "img");
          svg.setAttribute("aria-label", text);
          svg.setAttribute("tabindex", "0");
          
          // Add SVG title and description elements
          const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
          title.textContent = "Diagram";
          const desc = document.createElementNS("http://www.w3.org/2000/svg", "desc");
          desc.textContent = text;
          
          // Insert at beginning of SVG
          svg.insertBefore(desc, svg.firstChild);
          svg.insertBefore(title, svg.firstChild);
        } else {
          // Keep checking until SVG is rendered
          setTimeout(checkForSvg, 100);
        }
      };
      
      // Start checking immediately and after a delay
      checkForSvg();
    }
  });
});
