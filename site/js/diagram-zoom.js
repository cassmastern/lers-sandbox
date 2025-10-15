
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

    // Prevent wheel events from bubbling to prevent page zoom
    lb.addEventListener("wheel", (e) => {
      e.stopPropagation();
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
      
      // Add WCAG compliance - generate alt text from diagram content
      addAccessibilityAttributes(svg);
      
      svg.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("SVG clicked, opening lightbox");
        openLightbox(svg);
      });
    });
  }

  function addAccessibilityAttributes(svg) {
    // Extract diagram type and basic description for alt text
    const mermaidContainer = svg.closest('.mermaid');
    let altText = "Interactive diagram";
    
    // Try to determine diagram type from SVG content
    if (svg.querySelector('g[class*="flowchart"]')) {
      altText = "Interactive flowchart diagram - click to zoom";
    } else if (svg.querySelector('g[class*="sequence"]')) {
      altText = "Interactive sequence diagram - click to zoom";
    } else if (svg.querySelector('g[class*="class"]')) {
      altText = "Interactive class diagram - click to zoom";
    } else if (svg.querySelector('g[class*="state"]')) {
      altText = "Interactive state diagram - click to zoom";
    } else if (svg.querySelector('g[class*="pie"]')) {
      altText = "Interactive pie chart - click to zoom";
    } else if (svg.querySelector('g[class*="gantt"]')) {
      altText = "Interactive Gantt chart - click to zoom";
    }
    
    // Look for preceding comment or text that might describe the diagram
    if (mermaidContainer) {
      const prevSibling = mermaidContainer.previousElementSibling;
      if (prevSibling && (prevSibling.tagName === 'P' || prevSibling.tagName === 'H1' || 
                          prevSibling.tagName === 'H2' || prevSibling.tagName === 'H3')) {
        const description = prevSibling.textContent.trim();
        if (description.length > 0 && description.length < 200) {
          altText = `${description} - Interactive diagram, click to zoom`;
        }
      }
    }
    
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', altText);
    svg.setAttribute('tabindex', '0');
  }

  function waitForMermaid() {
    const checkForSvgs = () => {
      const svgs = document.querySelectorAll(".mermaid svg:not([data-mz-bound])");
      if (svgs.length > 0) {
        console.log("Mermaid SVGs found, binding zoom");
        bindZoom();
        // Continue checking for new SVGs that might render later
        setTimeout(checkForSvgs, 500);
      } else {
        // Check again in 100ms
        setTimeout(checkForSvgs, 100);
      }
    };
    checkForSvgs();
  }

  function init() {
    console.log("✅ DIAGRAM ZOOM: Initializing");
    console.log("✅ DIAGRAM ZOOM: Current URL:", window.location.href);
    console.log("✅ DIAGRAM ZOOM: Document ready state:", document.readyState);
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
    // Observer to watch for new Mermaid diagrams - with race condition fix
    const observer = new MutationObserver((mutations) => {
      let foundNewMermaidContainers = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if this is a mermaid container (may not have SVG yet)
            if (node.classList && node.classList.contains('mermaid')) {
              foundNewMermaidContainers = true;
            }
            // Also check for mermaid containers within the added node
            if (node.querySelectorAll) {
              const mermaidContainers = node.querySelectorAll('.mermaid');
              if (mermaidContainers.length > 0) {
                foundNewMermaidContainers = true;
              }
            }
          }
        });
      });
      
      // If we found new mermaid containers, wait a bit for SVGs to render then bind
      if (foundNewMermaidContainers) {
        console.log("New Mermaid containers detected, waiting for SVG rendering");
        setTimeout(() => {
          const svgs = document.querySelectorAll(".mermaid svg:not([data-mz-bound])");
          if (svgs.length > 0) {
            console.log("New Mermaid SVGs ready for binding");
            bindZoom();
          }
        }, 200); // Give Mermaid time to render the SVG
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();
