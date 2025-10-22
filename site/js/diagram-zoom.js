/**
 * Unified diagram zoom functionality
 * Supports Mermaid, PlantUML, and Graphviz diagrams
 * Handles theme switching and accessibility
 */
(function () {
  'use strict';

  // Global state
  let lightbox, content, escHandler, currentSvg;
  const boundSvgs = new WeakSet();

  // Configuration
  const CONFIG = {
    minScale: 0.25,
    maxScale: 4,
    zoomStep: 0.10,  // Reduced from 0.15 for slower, more gradual zoom
    debugMode: false
  };

  const log = CONFIG.debugMode ? console.log.bind(console, '[zoom]') : () => {};

  /**
   * Detect if PlantUML light or dark theme is active
   */
  function getActivePlantUMLTheme(svg) {
    const container = svg.closest('.puml-container');
    if (!container) return null;
    
    const lightDiv = container.querySelector('.puml_light');
    const darkDiv = container.querySelector('.puml_dark');
    
    if (lightDiv && lightDiv.offsetParent !== null) {
      return 'light';
    } else if (darkDiv && darkDiv.offsetParent !== null) {
      return 'dark';
    }
    
    return null;
  }

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
      
      // Remove PlantUML native controls from clone (keep diagram only)
      const controlDiv = clone.querySelector('.control');
      if (controlDiv) {
        controlDiv.remove();
        log('Removed PlantUML native controls from clone');
      }
      
      // Get dimensions from actual rendered size, not getBBox
      const originalRect = originalSvg.getBoundingClientRect();
      const width = originalRect.width || 400;
      const height = originalRect.height || 300;
      
      // Reset any inline size constraints on clone
      clone.style.width = 'auto';
      clone.style.height = 'auto';
      clone.style.maxWidth = '90vw';
      clone.style.maxHeight = '90vh';
      
      // Preserve aspect ratio
      if (originalSvg.hasAttribute('viewBox')) {
        // SVG with viewBox will scale naturally
        clone.setAttribute('width', width);
        clone.setAttribute('height', height);
      } else {
        // SVG without viewBox needs explicit sizing
        clone.style.width = width + 'px';
        clone.style.height = height + 'px';
      }
      
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
   * Bind zoom functionality to all diagram SVGs
   */
  function bindZoomToSvgs() {
    // Select all three diagram types
    const unboundSvgs = document.querySelectorAll(
      '.mermaid svg, ' +           // Mermaid
      '.puml-container svg, ' +     // PlantUML
      'svg.graphviz'                // Graphviz
    );
    
    let boundCount = 0;
    
    unboundSvgs.forEach((svg) => {
      // Skip if already bound
      if (boundSvgs.has(svg)) {
        return;
      }
      
      // Skip PlantUML control icons (only bind to diagram SVG)
      if (svg.closest('.control')) {
        log('Skipping PlantUML control icon');
        return;
      }
      
      // Mark as bound immediately
      boundSvgs.add(svg);
      svg.classList.add('mz-zoomable');
      
      // Force zoom-in cursor (override inline styles)
      svg.style.cursor = 'zoom-in';
      
      // Add click handler
      const clickHandler = (e) => {
        // For PlantUML, prevent native pan from interfering
        if (svg.closest('.puml-container')) {
          e.preventDefault();
          e.stopPropagation();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
        openLightbox(svg);
      };
      
      svg.addEventListener('click', clickHandler);
      
      boundCount++;
      log(`Bound zoom to SVG ${boundCount}`);
    });
    
    return boundCount;
  }

  /**
   * Clear bound SVGs tracking
   */
  function clearBoundSvgs() {
    log('Diagram reinitialized - old SVG references will be garbage collected');
  }

  /**
   * Wait for diagrams and bind zoom
   */
  function waitAndBindDiagrams() {
    const startTime = Date.now();
    const maxWait = 5000;
    
    function checkForSvgs() {
      const allSvgs = document.querySelectorAll(
        '.mermaid svg, .puml-container svg, svg.graphviz'
      );
      const unboundSvgs = Array.from(allSvgs).filter(svg => !boundSvgs.has(svg));
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
   * Handle Mermaid reinitialization (theme changes)
   */
  function handleMermaidReinit() {
    log('Mermaid reinitialized, rebinding zoom functionality...');
    clearBoundSvgs();
    
    setTimeout(() => {
      waitAndBindDiagrams();
    }, 200);
  }

  /**
   * Initialize zoom functionality
   */
  function initZoom() {
    log('Initializing diagram zoom...');
    
    ensureLightbox();
    
    setTimeout(waitAndBindDiagrams, 300);
    
    // Listen for Mermaid reinitialization (theme changes)
    document.addEventListener('mermaidReinitialized', handleMermaidReinit);
    
    // Set up mutation observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      let foundNewDiagrams = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.classList?.contains('mermaid') || 
                node.classList?.contains('puml-container') ||
                node.querySelector?.('.mermaid') ||
                node.querySelector?.('.puml-container') ||
                node.querySelector?.('svg.graphviz') ||
                (node.tagName === 'SVG' && (
                  node.closest?.('.mermaid') || 
                  node.closest?.('.puml-container') ||
                  node.classList?.contains('graphviz')
                ))) {
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
    
    document.removeEventListener('mermaidReinitialized', handleMermaidReinit);
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
    cleanup();
    setTimeout(initZoom, 200);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Handle Material theme's instant navigation
  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(() => {
      setTimeout(initialize, 100);
    });
  } else {
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
      cleanup,
      handleMermaidReinit
    };
  }

  window.addEventListener('beforeunload', cleanup);

})();
