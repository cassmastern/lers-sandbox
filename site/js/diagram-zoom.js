/**
 * Unified Diagram Zoom Functionality (REFACTORED)
 * Supports Mermaid, PlantUML, and Graphviz diagrams
 * Handles theme switching and accessibility
 * 
 * Dependencies: diagram-utils.js
 */
(function () {
  'use strict';

  // Ensure dependencies are loaded
  if (typeof DiagramUtils === 'undefined') {
    console.error('[diagram-zoom] DiagramUtils not loaded. Include diagram-utils.js first.');
    return;
  }

  const { CONSTANTS, createLogger, dispatchCustomEvent, safeAddEventListener,
          initWithMaterialSupport, isMermaidSvg, isPlantUMLControl } = DiagramUtils;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  const CONFIG = {
    minScale: 0.25,
    maxScale: 4,
    zoomStep: 0.10,
    debugMode: false
  };

  const log = createLogger('zoom', CONFIG.debugMode);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const state = {
    lightbox: null,
    content: null,
    escHandler: null,
    currentSvg: null,
    boundSvgs: new WeakSet()
  };

  // ============================================================================
  // LIGHTBOX CREATION
  // ============================================================================

  /**
   * Create lightbox overlay (singleton pattern)
   */
  function ensureLightbox() {
    if (state.lightbox) return state.lightbox;
    
    state.lightbox = document.createElement("div");
    state.lightbox.className = "mz-lightbox";
    state.lightbox.setAttribute("role", "dialog");
    state.lightbox.setAttribute("aria-modal", "true");
    state.lightbox.setAttribute("aria-label", "Diagram zoom view");
    state.lightbox.setAttribute("aria-hidden", "true");
    state.lightbox.tabIndex = -1;

    state.content = document.createElement("div");
    state.content.className = "mz-lightbox__content";
    state.lightbox.appendChild(state.content);

    // Close on background click
    safeAddEventListener(state.lightbox, "click", (e) => {
      if (e.target === state.lightbox || e.target === state.content) {
        closeLightbox();
      }
    });

    // Prevent wheel events from bubbling to page
    safeAddEventListener(state.lightbox, "wheel", (e) => {
      e.stopPropagation();
    }, { passive: false });

    document.body.appendChild(state.lightbox);
    log('Lightbox created');
    
    return state.lightbox;
  }

  // ============================================================================
  // SVG CLONING AND PREPARATION
  // ============================================================================

  /**
   * Prepare SVG clone for lightbox display
   * @param {SVGElement} originalSvg - Original SVG to clone
   * @returns {SVGElement} Prepared clone
   */
  function prepareSvgClone(originalSvg) {
    const clone = originalSvg.cloneNode(true);
    clone.classList.add("mz-lightbox__svg");
    
    // Remove PlantUML native controls from clone
    const controlDiv = clone.querySelector(CONSTANTS.SELECTORS.PLANTUML_CONTROL);
    if (controlDiv) {
      controlDiv.remove();
      log('Removed PlantUML native controls from clone');
    }
    
    // Get dimensions from actual rendered size
    const originalRect = originalSvg.getBoundingClientRect();
    const width = originalRect.width || 400;
    const height = originalRect.height || 300;
    
    // Reset size constraints on clone
    clone.style.width = 'auto';
    clone.style.height = 'auto';
    clone.style.maxWidth = '90vw';
    clone.style.maxHeight = '90vh';
    
    // Preserve aspect ratio
    if (originalSvg.hasAttribute('viewBox')) {
      clone.setAttribute('width', width);
      clone.setAttribute('height', height);
    } else {
      clone.style.width = width + 'px';
      clone.style.height = height + 'px';
    }
    
    return clone;
  }

  // ============================================================================
  // ZOOM AND PAN CONTROLS
  // ============================================================================

  /**
   * Create zoom and pan controller for an SVG
   * @param {SVGElement} svgClone - SVG element to control
   * @returns {Object} Controller object with methods
   */
  function createZoomController(svgClone) {
    const controller = {
      scale: 1,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      initialTouchDistance: 0,
      initialScale: 1
    };

    function updateTransform() {
      svgClone.style.transform = 
        `translate(${controller.currentX}px, ${controller.currentY}px) scale(${controller.scale})`;
    }

    function handleWheel(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = svgClone.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const delta = e.deltaY > 0 ? -CONFIG.zoomStep : CONFIG.zoomStep;
      const newScale = Math.min(Math.max(CONFIG.minScale, controller.scale + delta), CONFIG.maxScale);
      
      if (newScale !== controller.scale) {
        const scaleDiff = newScale - controller.scale;
        controller.currentX -= mouseX * scaleDiff;
        controller.currentY -= mouseY * scaleDiff;
        controller.scale = newScale;
        updateTransform();
      }
    }

    function handleMouseDown(e) {
      e.preventDefault();
      controller.isDragging = true;
      controller.dragStartX = e.clientX - controller.currentX;
      controller.dragStartY = e.clientY - controller.currentY;
      svgClone.style.cursor = "grabbing";
    }

    function handleMouseMove(e) {
      if (!controller.isDragging) return;
      e.preventDefault();
      controller.currentX = e.clientX - controller.dragStartX;
      controller.currentY = e.clientY - controller.dragStartY;
      updateTransform();
    }

    function handleMouseUp() {
      if (!controller.isDragging) return;
      controller.isDragging = false;
      svgClone.style.cursor = "grab";
    }

    function handleDoubleClick(e) {
      e.preventDefault();
      controller.scale = 1;
      controller.currentX = 0;
      controller.currentY = 0;
      updateTransform();
    }

    // Touch handlers
    function handleTouchStart(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        controller.initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
        controller.initialScale = controller.scale;
      }
    }

    function handleTouchMove(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (controller.initialTouchDistance > 0) {
          const scaleChange = distance / controller.initialTouchDistance;
          const newScale = Math.min(
            Math.max(CONFIG.minScale, controller.initialScale * scaleChange),
            CONFIG.maxScale
          );
          controller.scale = newScale;
          updateTransform();
        }
      }
    }

    function handleTouchEnd(e) {
      if (e.touches.length < 2) {
        controller.initialTouchDistance = 0;
        controller.initialScale = controller.scale;
      }
    }

    // Attach event listeners
    safeAddEventListener(svgClone, "wheel", handleWheel, { passive: false });
    safeAddEventListener(svgClone, "mousedown", handleMouseDown);
    safeAddEventListener(document, "mousemove", handleMouseMove);
    safeAddEventListener(document, "mouseup", handleMouseUp);
    safeAddEventListener(svgClone, "dblclick", handleDoubleClick);
    safeAddEventListener(svgClone, "touchstart", handleTouchStart, { passive: false });
    safeAddEventListener(svgClone, "touchmove", handleTouchMove, { passive: false });
    safeAddEventListener(svgClone, "touchend", handleTouchEnd);

    return controller;
  }

  // ============================================================================
  // LIGHTBOX OPERATIONS
  // ============================================================================

  /**
   * Open lightbox with SVG
   */
  function openLightbox(originalSvg) {
    try {
      ensureLightbox();
      state.content.innerHTML = "";
      state.currentSvg = originalSvg;

      const clone = prepareSvgClone(originalSvg);
      state.content.appendChild(clone);
      
      // Show lightbox
      state.lightbox.setAttribute("aria-hidden", "false");
      state.lightbox.focus();

      // Initialize zoom controls
      createZoomController(clone);

      // Set up keyboard handler
      setupKeyboardHandler();

      log('Lightbox opened');

    } catch (error) {
      console.warn('Error opening lightbox:', error);
    }
  }

  /**
   * Set up keyboard handler
   */
  function setupKeyboardHandler() {
    state.escHandler = (e) => {
      if (e.key === "Escape") {
        closeLightbox();
      }
    };
    
    safeAddEventListener(document, "keydown", state.escHandler);
  }

  /**
   * Close lightbox
   */
  function closeLightbox() {
    if (!state.lightbox) return;
    
    try {
      state.lightbox.setAttribute("aria-hidden", "true");
      
      if (state.content) {
        state.content.innerHTML = "";
      }
      
      if (state.escHandler) {
        document.removeEventListener("keydown", state.escHandler);
        state.escHandler = null;
      }
      
      state.currentSvg = null;
      log('Lightbox closed');
      
    } catch (error) {
      console.warn('Error closing lightbox:', error);
    }
  }

  // ============================================================================
  // SVG BINDING
  // ============================================================================

  /**
   * Bind zoom functionality to an SVG element
   * @param {SVGElement} svg - SVG to bind zoom to
   * @returns {boolean} True if bound successfully
   */
  function bindZoomToSvg(svg) {
    // Skip if already bound
    if (state.boundSvgs.has(svg)) {
      return false;
    }
    
    // Skip PlantUML control icons
    if (isPlantUMLControl(svg)) {
      log('Skipping PlantUML control icon');
      return false;
    }
    
    // Mark as bound
    state.boundSvgs.add(svg);
    svg.classList.add('mz-zoomable');
    
    // Force zoom-in cursor
    svg.style.cursor = 'zoom-in';
    
    // Add click handler
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(svg);
    };
    
    safeAddEventListener(svg, 'click', clickHandler);
    
    log('Bound zoom to SVG');
    return true;
  }

  /**
   * Bind zoom to all unbound diagram SVGs
   */
  function bindZoomToSvgs() {
    const unboundSvgs = document.querySelectorAll(CONSTANTS.SELECTORS.ALL_DIAGRAMS);
    let boundCount = 0;
    
    unboundSvgs.forEach((svg) => {
      if (bindZoomToSvg(svg)) {
        boundCount++;
      }
    });
    
    if (boundCount > 0) {
      log(`Bound zoom to ${boundCount} new diagrams`);
      dispatchCustomEvent(CONSTANTS.EVENTS.DIAGRAM_ZOOM_BOUND, { count: boundCount });
    }
    
    return boundCount;
  }

  /**
   * Clear bound SVGs tracking
   */
  function clearBoundSvgs() {
    log('Diagram reinitialized - old SVG references will be garbage collected');
  }

  // ============================================================================
  // DIAGRAM DETECTION AND BINDING
  // ============================================================================

  /**
   * Wait for diagrams and bind zoom
   */
  function waitAndBindDiagrams() {
    const startTime = Date.now();
    
    function checkForSvgs() {
      const allSvgs = document.querySelectorAll(CONSTANTS.SELECTORS.ALL_DIAGRAMS);
      const unboundSvgs = Array.from(allSvgs).filter(svg => !state.boundSvgs.has(svg));
      const timeElapsed = Date.now() - startTime;
      
      if (unboundSvgs.length > 0) {
        bindZoomToSvgs();
      }
      
      // Continue checking if within time limit
      if (timeElapsed < CONSTANTS.TIMING.MAX_WAIT) {
        setTimeout(checkForSvgs, CONSTANTS.TIMING.MEDIUM_DELAY);
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
    }, CONSTANTS.TIMING.MEDIUM_DELAY);
  }

  /**
   * Create mutation observer for dynamic content
   */
  function createDiagramObserver() {
    const observer = new MutationObserver((mutations) => {
      let foundNewDiagrams = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const isDiagramNode = 
              node.classList?.contains('mermaid') ||
              node.classList?.contains('puml-container') ||
              node.querySelector?.(CONSTANTS.SELECTORS.ALL_DIAGRAMS) ||
              (node.tagName === 'SVG' && (
                isMermaidSvg(node) ||
                isPlantUMLControl(node) ||
                node.classList?.contains('graphviz')
              ));
              
            if (isDiagramNode) {
              foundNewDiagrams = true;
            }
          }
        });
      });

      if (foundNewDiagrams) {
        log('New diagrams detected, binding zoom...');
        setTimeout(bindZoomToSvgs, CONSTANTS.TIMING.LONG_DELAY);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize zoom functionality
   */
  function initZoom() {
    log('Initializing diagram zoom...');
    
    ensureLightbox();
    
    setTimeout(waitAndBindDiagrams, CONSTANTS.TIMING.LONG_DELAY);
    
    // Listen for Mermaid reinitialization
    safeAddEventListener(document, CONSTANTS.EVENTS.MERMAID_REINITIALIZED, handleMermaidReinit);
    
    // Set up mutation observer
    createDiagramObserver();
    
    // Listen for accessibility processing completion
    safeAddEventListener(document, CONSTANTS.EVENTS.DIAGRAMS_ACCESSIBILITY_PROCESSED, () => {
      log('Accessibility processing completed, checking for new diagrams');
      setTimeout(bindZoomToSvgs, CONSTANTS.TIMING.SHORT_DELAY);
    });

    log('Zoom initialization complete');
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    if (state.lightbox && state.lightbox.parentNode) {
      state.lightbox.parentNode.removeChild(state.lightbox);
    }
    state.lightbox = null;
    state.content = null;
    state.currentSvg = null;
    
    if (state.escHandler) {
      document.removeEventListener('keydown', state.escHandler);
      state.escHandler = null;
    }
    
    document.removeEventListener(CONSTANTS.EVENTS.MERMAID_REINITIALIZED, handleMermaidReinit);
  }

  /**
   * Handle page visibility changes
   */
  function handleVisibilityChange() {
    if (document.hidden && state.lightbox && 
        state.lightbox.getAttribute('aria-hidden') === 'false') {
      closeLightbox();
    }
  }

  /**
   * Main initialization
   */
  function initialize() {
    cleanup();
    setTimeout(initZoom, CONSTANTS.TIMING.MEDIUM_DELAY);
    safeAddEventListener(document, 'visibilitychange', handleVisibilityChange);
  }

  // Initialize with Material navigation support
  initWithMaterialSupport(initialize, CONSTANTS.TIMING.SHORT_DELAY);

  // ============================================================================
  // DEBUG EXPORTS
  // ============================================================================

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

  // Cleanup on page unload
  safeAddEventListener(window, 'beforeunload', cleanup);

})();
