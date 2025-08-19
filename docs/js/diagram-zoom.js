/**
 * Fixed and simplified diagram zoom functionality
 * Addresses multiple SVG binding issues and race conditions
 */
(function () {
  'use strict';

  // Global state
  let lightbox, content, escHandler, currentSvg;
  const boundSvgs = new WeakSet(); // Track bound SVGs to prevent double-binding

  // Configuration
  const CONFIG = {
    minScale: 0.25,
    maxScale: 4,
    zoomStep: 0.15,
    debugMode: false
  };

  const log = CONFIG.debugMode ? console.log.bind(console, '[zoom]') : () => {};

  /**
   * Create lightbox overlay (singleton pattern)
   */
  function ensureLightbox() {
    if (lightbox) return lightbox;
    
    lightbox = document.createElement("div");
    lightbox.className = "mz-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Diagram zoom view");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.tabIndex = -1;

    content = document.createElement("div");
    content.className = "mz-lightbox__content";
    lightbox.appendChild(content);

    // Close on background click
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === content) {
        closeLightbox();
      }
    });

    // Prevent wheel events from bubbling to page
    lightbox.addEventListener("wheel", (e) => {
      e.stopPropagation();
    }, { passive: false });

    document.body.appendChild(lightbox);
    log('Lightbox created');
    
    return lightbox;
  }

  /**
   * Open lightbox with SVG
   */
  function openLightbox(originalSvg) {
    try {
      ensureLightbox();
      content.innerHTML = "";
      currentSvg = originalSvg;

      // Clone the SVG
      const clone = originalSvg.cloneNode(true);
      clone.classList.add("mz-lightbox__svg");
      
      // Get dimensions safely
      let width, height;
      try {
        const bbox = originalSvg.getBBox();
        width = bbox.width || originalSvg.clientWidth || 400;
        height = bbox.height || originalSvg.clientHeight || 300;
      } catch (e) {
        width = originalSvg.clientWidth || 400;
        height = originalSvg.clientHeight || 300;
      }
      
      // Set initial dimensions
      clone.style.width = width + "px";
      clone.style.height = height + "px";
      
      content.appendChild(clone);
      
      // Show lightbox
      lightbox.setAttribute("aria-hidden", "false");
      lightbox.focus();

      // Initialize zoom controls
      initializeZoomControls(clone);

      // Set up keyboard handler
      setupKeyboardHandler();

      log('Lightbox opened');

    } catch (error) {
      console.warn('Error opening lightbox:', error);
    }
  }

  /**
   * Initialize zoom and pan controls
   */
  function initializeZoomControls(svgClone) {
    let scale = 1;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    function updateTransform() {
      svgClone.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
    }

    // Mouse wheel zoom
    svgClone.addEventListener("wheel", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = svgClone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const delta = e.deltaY > 0 ? -CONFIG.zoomStep : CONFIG.zoomStep;
      const newScale = Math.min(Math.max(CONFIG.minScale, scale + delta), CONFIG.maxScale);
      
      if (newScale !== scale) {
        const scaleDiff = newScale - scale;
        currentX -= mouseX * scaleDiff;
        currentY -= mouseY * scaleDiff;
        scale = newScale;
        updateTransform();
      }
    }, { passive: false });

    // Mouse drag
    svgClone.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      dragStartX = e.clientX - currentX;
      dragStartY = e.clientY - currentY;
      svgClone.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - dragStartX;
      currentY = e.clientY - dragStartY;
      updateTransform();
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      svgClone.style.cursor = "grab";
    });

    // Touch handling
    let initialTouchDistance = 0;
    let initialScale = 1;

    svgClone.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
        initialScale = scale;
      }
    }, { passive: false });

    svgClone.addEventListener("touchmove", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (initialTouchDistance > 0) {
          const scaleChange = distance / initialTouchDistance;
          const newScale = Math.min(Math.max(CONFIG.minScale, initialScale * scaleChange), CONFIG.maxScale);
          scale = newScale;
          updateTransform();
        }
      }
    }, { passive: false });

    svgClone.addEventListener("touchend", (e) => {
      if (e.touches.length < 2) {
        initialTouchDistance = 0;
        initialScale = scale;
      }
    });

    // Double-click to reset
    svgClone.addEventListener("dblclick", (e) => {
      e.preventDefault();
      scale = 1;
      currentX = 0;
      currentY = 0;
      updateTransform();
    });
  }

  /**
   * Set up keyboard handler
   */
  function setupKeyboardHandler() {
    escHandler = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };
    
    document.addEventListener("keydown", escHandler);
  }

  /**
   * Close lightbox
   */
  function closeLightbox() {
    if (!lightbox) return;
    
    try {
      lightbox.setAttribute("aria-hidden", "true");
      
      if (content) {
        content.innerHTML = "";
      }
      
      if (escHandler) {
        document.removeEventListener("keydown", escHandler);
        escHandler = null;
      }
      
      currentSvg = null;
      log('Lightbox closed');
      
    } catch (error) {
      console.warn('Error closing lightbox:', error);
    }
  }

  /**
   * Bind zoom functionality to SVG elements
   * Fixed to prevent double-binding and race conditions
   */
  function bindZoomToSvgs() {
    const unboundSvgs = document.querySelectorAll('.mermaid svg');
    let boundCount = 0;
    
    unboundSvgs.forEach((svg) => {
      // Skip if already bound (using WeakSet for reliable tracking)
      if (boundSvgs.has(svg)) {
        return;
      }
      
      // Mark as bound immediately
      boundSvgs.add(svg);
      svg.classList.add('mz-zoomable');
      
      // Add click handler
      const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(svg);
      };
      
      svg.addEventListener('click', clickHandler);
      
      boundCount++;
      log(`Bound zoom to SVG ${boundCount}`);
    });
    
    return boundCount;
  }

  /**
   * Wait for Mermaid diagrams and bind zoom
   */
  function waitAndBindDiagrams() {
    const startTime = Date.now();
    const maxWait = 5000;
    
    function checkForSvgs() {
      const svgs = document.querySelectorAll('.mermaid svg');
      const unboundSvgs = Array.from(svgs).filter(svg => !boundSvgs.has(svg));
      const timeElapsed = Date.now() - startTime;
      
      if (unboundSvgs.length > 0) {
        const boundCount = bindZoomToSvgs();
        log(`Bound zoom to ${boundCount} new diagrams`);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('diagramZoomBound', {
          detail: { count: boundCount }
        }));
      }
      
      // Continue checking if within time limit
      if (timeElapsed < maxWait) {
        setTimeout(checkForSvgs, 200);
      }
    }
    
    checkForSvgs();
  }

  /**
   * Initialize zoom functionality
   */
  function initZoom() {
    log('Initializing diagram zoom...');
    
    // Ensure lightbox exists
    ensureLightbox();
    
    // Initial binding after a short delay for Mermaid rendering
    setTimeout(waitAndBindDiagrams, 300);
    
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let foundNewDiagrams = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.classList?.contains('mermaid') || 
                node.querySelector?.('.mermaid') ||
                (node.tagName === 'SVG' && node.closest?.('.mermaid'))) {
              foundNewDiagrams = true;
            }
          }
        });
      });

      if (foundNewDiagrams) {
        log('New diagrams detected, binding zoom...');
        setTimeout(bindZoomToSvgs, 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Listen for accessibility processing completion
    document.addEventListener('diagramsAccessibilityProcessed', () => {
      log('Accessibility processing completed, checking for new diagrams');
      setTimeout(bindZoomToSvgs, 100);
    });

    log('Zoom initialization complete');
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    if (lightbox && lightbox.parentNode) {
      lightbox.parentNode.removeChild(lightbox);
    }
    lightbox = null;
    content = null;
    currentSvg = null;
    
    if (escHandler) {
      document.removeEventListener('keydown', escHandler);
      escHandler = null;
    }
  }

  /**
   * Handle page visibility changes
   */
  function handleVisibilityChange() {
    if (document.hidden && lightbox && lightbox.getAttribute('aria-hidden') === 'false') {
      closeLightbox();
    }
  }

  /**
   * Main initialization
   */
  function initialize() {
    cleanup(); // Clean up any existing state
    setTimeout(initZoom, 200);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Handle Material theme's instant navigation
  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(() => {
      setTimeout(initialize, 100);
    });
  } else {
    // Handle regular page loads
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  }

  // Expose for debugging
  if (CONFIG.debugMode) {
    window.diagramZoom = {
      bindZoomToSvgs,
      openLightbox,
      closeLightbox,
      cleanup
    };
  }

  // Handle page unload
  window.addEventListener('beforeunload', cleanup);

})();
