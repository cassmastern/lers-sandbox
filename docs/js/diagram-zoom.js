
(function () {
  let lb, content, escHandler;

  function ensureLightbox() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "mz-lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-hidden", "true");
    lb.tabIndex = -1;

    content = document.createElement("div");
    content.className = "mz-lightbox__content";
    lb.appendChild(content);

    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target === content) closeLightbox();
    });

    document.body.appendChild(lb);
  }

  function openLightbox(svg) {
    console.log("Opening lightbox for SVG", svg);
    ensureLightbox();
    content.innerHTML = "";
    const clone = svg.cloneNode(true);
    clone.classList.add("mz-lightbox__svg");
    content.appendChild(clone);
    lb.setAttribute("aria-hidden", "false");
    lb.focus();

    escHandler = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", escHandler, { once: true });
  }

  function closeLightbox() {
    if (!lb) return;
    lb.setAttribute("aria-hidden", "true");
    content.innerHTML = "";
    if (escHandler) {
      document.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
  }

  function bindZoom(root = document) {
    const svgs = root.querySelectorAll(".mermaid svg:not([data-mz-bound])");
    console.log("Found SVGs to bind:", svgs.length);
    
    svgs.forEach((svg) => {
      console.log("Binding zoom to SVG", svg);
      svg.setAttribute("data-mz-bound", "true");
      svg.classList.add("mz-zoomable");
      svg.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("SVG clicked, opening lightbox");
        openLightbox(svg);
      });
    });
  }

  function waitForMermaid() {
    const checkForSvgs = () => {
      const svgs = document.querySelectorAll(".mermaid svg:not([data-mz-bound])");
      if (svgs.length > 0) {
        console.log("Mermaid SVGs found, binding zoom");
        bindZoom();
      } else {
        // Check again in 100ms
        setTimeout(checkForSvgs, 100);
      }
    };
    checkForSvgs();
  }

  function init() {
    console.log("Initializing diagram zoom");
    ensureLightbox();
    // Wait for Mermaid to render
    setTimeout(waitForMermaid, 100);
  }

  // Handle MkDocs Material navigation
  if (window.document$ && window.document$.subscribe) {
    console.log("Using MkDocs Material navigation handler");
    document$.subscribe(() => {
      setTimeout(init, 200);
    });
  } else {
    console.log("Using standard DOMContentLoaded");
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  // Also listen for when Mermaid finishes rendering
  document.addEventListener("DOMContentLoaded", () => {
    // Observer to watch for new Mermaid diagrams
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const svgs = node.querySelectorAll ? node.querySelectorAll(".mermaid svg:not([data-mz-bound])") : [];
            if (svgs.length > 0) {
              console.log("New Mermaid SVGs detected via observer");
              bindZoom(node);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();
