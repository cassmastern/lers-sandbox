/**
 * Shared utilities for diagram handling
 * Used by diagram-theme-switcher.js, diagram-zoom.js, and seamaiden.js
 */
(function(window) {
  'use strict';

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  
  const CONSTANTS = {
    // Timing constants (ms)
    TIMING: {
      QUICK_DELAY: 50,
      SHORT_DELAY: 100,
      MEDIUM_DELAY: 200,
      LONG_DELAY: 300,
      MAX_WAIT: 5000
    },
    
    // Selectors for different diagram types
    SELECTORS: {
      MERMAID: '.mermaid svg',
      PLANTUML: '.puml-container svg',
      GRAPHVIZ: 'svg.graphviz',
      ALL_DIAGRAMS: '.mermaid svg, .puml-container svg, svg.graphviz',
      PLANTUML_CONTAINER: '.puml-container',
      PLANTUML_LIGHT: '.puml_light',
      PLANTUML_DARK: '.puml_dark',
      GRAPHVIZ_CONTAINER: '[class*="graphviz"]',
      GRAPHVIZ_LIGHT: '.graphviz-light, [class*="graphviz-light"]',
      GRAPHVIZ_DARK: '.graphviz-dark, [class*="graphviz-dark"]',
      PLANTUML_CONTROL: '.control'
    },
    
    // Custom event names
    EVENTS: {
      DIAGRAM_THEME_APPLIED: 'diagramThemeApplied',
      DIAGRAM_ZOOM_BOUND: 'diagramZoomBound',
      MERMAID_REINITIALIZED: 'mermaidReinitialized',
      DIAGRAMS_ACCESSIBILITY_PROCESSED: 'diagramsAccessibilityProcessed'
    },
    
    // Theme constants
    THEMES: {
      LIGHT: 'light',
      DARK: 'dark',
      SLATE: 'slate'
    }
  };

  // ============================================================================
  // LOGGING UTILITIES
  // ============================================================================
  
  /**
   * Create a namespaced logger
   * @param {string} namespace - Logger namespace (e.g., 'zoom', 'theme')
   * @param {boolean} enabled - Whether debug logging is enabled
   * @returns {Function} Logger function
   */
  function createLogger(namespace, enabled = false) {
    const prefix = `[${namespace}]`;
    return enabled ? console.log.bind(console, prefix) : () => {};
  }

  // ============================================================================
  // THEME DETECTION
  // ============================================================================
  
  /**
   * Get current Material theme from body attribute
   * @returns {string} 'light' or 'dark'
   */
  function getCurrentTheme() {
    const scheme = document.body.getAttribute('data-md-color-scheme');
    return scheme === CONSTANTS.THEMES.SLATE ? CONSTANTS.THEMES.DARK : CONSTANTS.THEMES.LIGHT;
  }
  
  /**
   * Check if current theme is dark mode
   * @returns {boolean}
   */
  function isDarkMode() {
    return getCurrentTheme() === CONSTANTS.THEMES.DARK;
  }

  // ============================================================================
  // ELEMENT VISIBILITY UTILITIES
  // ============================================================================
  
  /**
   * Show an element (display: block)
   * @param {HTMLElement} element
   */
  function showElement(element) {
    if (element) {
      element.style.display = 'block';
    }
  }
  
  /**
   * Hide an element (display: none)
   * @param {HTMLElement} element
   */
  function hideElement(element) {
    if (element) {
      element.style.display = 'none';
    }
  }
  
  /**
   * Toggle elements based on theme
   * @param {HTMLElement} lightElement - Element to show in light mode
   * @param {HTMLElement} darkElement - Element to show in dark mode
   * @param {string} theme - Current theme ('light' or 'dark')
   */
  function toggleThemeElements(lightElement, darkElement, theme) {
    if (theme === CONSTANTS.THEMES.LIGHT) {
      showElement(lightElement);
      hideElement(darkElement);
    } else {
      hideElement(lightElement);
      showElement(darkElement);
    }
  }

  // ============================================================================
  // EVENT UTILITIES
  // ============================================================================
  
  /**
   * Dispatch a custom event with detail data
   * @param {string} eventName - Name of the event
   * @param {Object} detail - Event detail object
   */
  function dispatchCustomEvent(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  
  /**
   * Add event listener with error handling
   * @param {EventTarget} target - Element to attach listener to
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   */
  function safeAddEventListener(target, eventType, handler, options = {}) {
    try {
      target.addEventListener(eventType, handler, options);
    } catch (error) {
      console.warn(`Failed to add ${eventType} listener:`, error);
    }
  }

  // ============================================================================
  // MUTATION OBSERVER UTILITIES
  // ============================================================================
  
  /**
   * Create a mutation observer for theme changes on body element
   * @param {Function} callback - Callback when theme changes
   * @returns {MutationObserver}
   */
  function createThemeObserver(callback) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-md-color-scheme') {
          callback();
        }
      });
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
    
    return observer;
  }

  // ============================================================================
  // MATERIAL NAVIGATION UTILITIES
  // ============================================================================
  
  /**
   * Initialize with Material's instant navigation support
   * Handles both document$ observable and standard DOM ready
   * @param {Function} initFunction - Initialization function
   * @param {number} delay - Delay before initialization (ms)
   */
  function initWithMaterialSupport(initFunction, delay = 0) {
    const init = () => setTimeout(initFunction, delay);
    
    // Material's instant navigation
    if (typeof document$ !== 'undefined' && document$.subscribe) {
      document$.subscribe(init);
    } else {
      // Standard initialization
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
    }
  }

  // ============================================================================
  // SVG UTILITIES
  // ============================================================================
  
  /**
   * Check if SVG is a Mermaid diagram
   * @param {SVGElement} svg - SVG element to check
   * @returns {boolean}
   */
  function isMermaidSvg(svg) {
    let parent = svg.parentElement;
    while (parent) {
      const classes = parent.classList;
      if (classes && classes.contains('mermaid')) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }
  
  /**
   * Check if SVG is inside PlantUML control div
   * @param {SVGElement} svg - SVG element to check
   * @returns {boolean}
   */
  function isPlantUMLControl(svg) {
    return svg.closest(CONSTANTS.SELECTORS.PLANTUML_CONTROL) !== null;
  }
  
  /**
   * Get active PlantUML theme variant (light or dark)
   * @param {SVGElement} svg - SVG element
   * @returns {string|null} 'light', 'dark', or null
   */
  function getActivePlantUMLTheme(svg) {
    const container = svg.closest(CONSTANTS.SELECTORS.PLANTUML_CONTAINER);
    if (!container) return null;
    
    const lightDiv = container.querySelector(CONSTANTS.SELECTORS.PLANTUML_LIGHT);
    const darkDiv = container.querySelector(CONSTANTS.SELECTORS.PLANTUML_DARK);
    
    if (lightDiv && lightDiv.offsetParent !== null) {
      return CONSTANTS.THEMES.LIGHT;
    } else if (darkDiv && darkDiv.offsetParent !== null) {
      return CONSTANTS.THEMES.DARK;
    }
    
    return null;
  }

  // ============================================================================
  // RETRY UTILITIES
  // ============================================================================
  
  /**
   * Wait for condition to be true with timeout
   * @param {Function} conditionFn - Function that returns boolean
   * @param {Function} callback - Callback when condition is met
   * @param {Object} options - Options object
   * @param {number} options.interval - Check interval in ms
   * @param {number} options.timeout - Max wait time in ms
   */
  function waitForCondition(conditionFn, callback, options = {}) {
    const {
      interval = CONSTANTS.TIMING.MEDIUM_DELAY,
      timeout = CONSTANTS.TIMING.MAX_WAIT
    } = options;
    
    const startTime = Date.now();
    
    function check() {
      if (conditionFn()) {
        callback();
        return;
      }
      
      const elapsed = Date.now() - startTime;
      if (elapsed < timeout) {
        setTimeout(check, interval);
      }
    }
    
    check();
  }

  // ============================================================================
  // EXPORT
  // ============================================================================
  
  window.DiagramUtils = {
    CONSTANTS,
    createLogger,
    getCurrentTheme,
    isDarkMode,
    showElement,
    hideElement,
    toggleThemeElements,
    dispatchCustomEvent,
    safeAddEventListener,
    createThemeObserver,
    initWithMaterialSupport,
    isMermaidSvg,
    isPlantUMLControl,
    getActivePlantUMLTheme,
    waitForCondition
  };

})(window);
