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

    lb.addEventListener("wheel", (e) => {
      e.stopPropagation();
    });

    document.body.appendChild(lb);
  }

  function openLightbox(svg) {
    ensureLightbox();
    content.innerHTML = "";

    const clone = svg.cloneNode(true);
    clone.classList.add("mz-lightbox__svg");

    // Set initial size to the natural SVG size
    clone.style.width = svg.getBBox().width + "px";
    clone.style.height = svg.getBBox().height + "px";

    content.appendChild(clone);
    lb.setAttribute("aria-hidden", "false");
    lb.focus();

    // --- INTERNAL ZOOM ---
    let scale = 1;
    let currentX = 0, currentY = 0;

    // Desktop: scroll zoom
    clone.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      scale = Math.min(Math.max(0.5, scale + delta), 3);
      clone.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    });

    // Drag-to-pan
    let isDragging = false, startX, startY;
    clone.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      clone.style.cursor = "grabbing";
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      clone.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    });
    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      clone.style.cursor = "grab";
    });

    // Mobile: pinch-to-zoom
    let initialDistance = 0;
    clone.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx*dx + dy*dy);
      }
    }, { passive: false });

    clone.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const deltaScale = (distance - initialDistance) / 200;
        scale = Math.min(Math.max(0.5, scale + deltaScale), 3);
        initialDistance = distance;
        clone.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
      }
    }, { passive: false });

    // --- CLOSE ON ESC ---
    escHandler = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", escHandler, { once: true });
  }

  function closeLightbox() {
    if (!lb) return;
    lb.setAttribute("aria-hidden", "true");
    if (content) {
      content.innerHTML = "";
    }
    if (escHandler) {
      document.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
  }

  // NEW: Function to find ALT comment before mermaid diagram
  function findAltComment(mermaidContainer) {
    // Look for HTML comment with ALT: prefix in preceding text nodes
    let currentNode = mermaidContainer.previousSibling;
    let searchDepth = 0;
    const maxSearchDepth = 10; // Limit search to avoid performance issues
    
    while (currentNode && searchDepth < maxSearchDepth) {
      if (currentNode.nodeType === Node.COMMENT_NODE) {
        const commentText = currentNode.textContent.trim();
        if (commentText.startsWith('ALT:')) {
          return commentText.substring(4).trim(); // Remove 'ALT:' prefix
        }
      }
      // Also check text content of previous element for comments
      else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const htmlContent = currentNode.innerHTML;
        const commentMatch = htmlContent.match(/<!--\s*ALT:\s*(.*?)\s*-->/s);
        if (commentMatch) {
          return commentMatch[1].trim();
        }
      }
      
      currentNode = currentNode.previousSibling;
      searchDepth++;
    }
    
    // If no ALT comment found, also check parent's previous siblings
    const parent = mermaidContainer.parentNode;
    if (parent) {
      let parentPrev = parent.previousSibling;
      let parentSearchDepth = 0;
      
      while (parentPrev && parentSearchDepth < 5) {
        if (parentPrev.nodeType === Node.COMMENT_NODE) {
          const commentText = parentPrev.textContent.trim();
          if (commentText.startsWith('ALT:')) {
            return commentText.substring(4).trim();
          }
        } else if (parentPrev.nodeType === Node.ELEMENT_NODE) {
          const htmlContent = parentPrev.innerHTML;
          const commentMatch = htmlContent.match(/<!--\s*ALT:\s*(.*?)\s*-->/s);
          if (commentMatch) {
            return commentMatch[1].trim();
          }
        }
        
        parentPrev = parentPrev.previousSibling;
        parentSearchDepth++;
      }
    }
    
    return null;
  }

  function addAccessibilityAttributes(svg) {
    const mermaidContainer = svg.closest('.mermaid');
    let altText = "Interactive diagram";
    
    // NEW: First try to find ALT comment
    if (mermaidContainer) {
      const commentAlt = findAltComment(mermaidContainer);
      if (commentAlt) {
        altText = commentAlt + " - Click to zoom and pan";
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', altText);
        svg.setAttribute('tabindex', '0');
        return; // Exit early if we found a comment
      }
    }
    
    // FALLBACK: Use existing logic if no ALT comment found
    if (svg.querySelector('g[class*="flowchart"]')) altText = "Interactive flowchart diagram - click to zoom";
    else if (svg.querySelector('g[class*="sequence"]')) altText = "Interactive sequence diagram - click to zoom";
    else if (svg.querySelector('g[class*="class"]')) altText = "Interactive class diagram - click to zoom";
    else if (svg.querySelector('g[class*="state"]')) altText = "Interactive state diagram - click to zoom";
    else if (svg.querySelector('g[class*="pie"]')) altText = "Interactive pie chart - click to zoom";
    else if (svg.querySelector('g[class*="gantt"]')) altText = "Interactive Gantt chart - click to zoom";

    // Existing fallback to preceding text (kept as secondary option)
    if (mermaidContainer && altText === "Interactive diagram") {
      const prevSibling = mermaidContainer.previousElementSibling;
      if (prevSibling && (prevSibling.tagName === 'P' || /^H[1-6]$/.test(prevSibling.tagName))) {
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

  function bindZoom(root = document) {
    // Target all SVGs in mermaid containers, regardless of specific classes
    const svgs = root.querySelectorAll(".mermaid svg:not([data-mz-bound])");
    svgs.forEach((svg) => {
      svg.setAttribute("data-mz-bound", "true");
      svg.classList.add("mz-zoomable");
      addAccessibilityAttributes(svg);
      
      // Make sure SVG is clickable
      svg.style.cursor = "zoom-in";
      svg.setAttribute("role", "button");
      
      svg.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(svg);
      });
      
      // Also add keyboard support
      svg.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          openLightbox(svg);
        }
      });
    });
  }

  function waitForMermaid() {
    const checkForSvgs = () => {
      const svgs = document.querySelectorAll(".mermaid svg:not([data-mz-bound])");
      if (svgs.length > 0) {
        bindZoom();
        setTimeout(checkForSvgs, 500);
      } else {
        setTimeout(checkForSvgs, 100);
      }
    };
    checkForSvgs();
  }

  function init() {
    ensureLightbox();
    setTimeout(waitForMermaid, 100);
  }

  if (window.document$ && window.document$.subscribe) {
    document$.subscribe(() => {
      setTimeout(init, 200);
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver((mutations) => {
      let foundNewMermaidContainers = false;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.classList && node.classList.contains('mermaid')) foundNewMermaidContainers = true;
            if (node.querySelectorAll) {
              const mermaidContainers = node.querySelectorAll('.mermaid');
              if (mermaidContainers.length > 0) foundNewMermaidContainers = true;
            }
          }
        });
      });
      if (foundNewMermaidContainers) {
        setTimeout(() => {
          const svgs = document.querySelectorAll(".mermaid svg:not([data-mz-bound])");
          if (svgs.length > 0) bindZoom();
        }, 200);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();
