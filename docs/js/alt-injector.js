function injectAltText() {
  const diagrams = document.querySelectorAll(".zoomable-diagram");

  diagrams.forEach(diagram => {
    if (!diagram.hasAttribute("alt")) {
      const filename = diagram.getAttribute("src") || "diagram";
      const altText = `Diagram: ${filename.split('/').pop().replace('.svg', '')}`;
      diagram.setAttribute("alt", altText);
      diagram.setAttribute("role", "img");
      diagram.setAttribute("aria-label", altText);
    }
  });
}

document.addEventListener("DOMContentLoaded", injectAltText);
document.addEventListener("pjax:end", injectAltText);
