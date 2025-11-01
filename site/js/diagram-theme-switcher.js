/**
 * Unified Diagram Theme Switcher (REFACTORED)
 * Handles theme switching for PlantUML and Graphviz diagrams
 * Works alongside seamaiden.js (which handles Mermaid)
 * 
 * Dependencies: diagram-utils.js
 */
(function() {
  'use strict';

  // Ensure dependencies are loaded
  if (typeof DiagramUtils === 'undefined') {
    console.error('[diagram-theme] DiagramUtils not loaded. Include diagram-utils.js first.');
    return;
  }

  const { CONSTANTS, createLogger, getCurrentTheme, toggleThemeElements, 
          dispatchCustomEvent, createThemeObserver, initWithMaterialSupport } = DiagramUtils;

  // Configuration
  const CONFIG = {
    debugMode: true  // Enable debug logging
  };

  const log = createLogger('diagram-theme', CONFIG.debugMode);

  // ============================================================================
  // THEME APPLICATION
  // ============================================================================

  /**
   * Apply theme to PlantUML diagrams
   * Structure: <div class="puml-container"><div class="puml_light">...<div class="puml_dark">...
   */
  function applyPlantUMLTheme(theme) {
    const containers = document.querySelectorAll(CONSTANTS.SELECTORS.PLANTUML_CONTAINER);
    
    containers.forEach(container => {
      const lightDiv = container.querySelector(CONSTANTS.SELECTORS.PLANTUML_LIGHT);
      const darkDiv = container.querySelector(CONSTANTS.SELECTORS.PLANTUML_DARK);
      
      if (lightDiv && darkDiv) {
        toggleThemeElements(lightDiv, darkDiv, theme);
        log(`PlantUML: Showing ${theme} theme`);
      }
    });
  }

  /**
   * Apply theme to Graphviz diagrams
   * Expected structure after mkdocs-graphviz theme config:
   * <div class="graphviz-light-dark">
   *   <div class="graphviz-light">...<div class="graphviz-dark">...
   * OR possibly: <span class="graphviz-light">...<span class="graphviz-dark">...
   */
  function applyGraphvizTheme(theme) {
    // Strategy 1: Look for container with separate light/dark divs
    const containers = document.querySelectorAll(CONSTANTS.SELECTORS.GRAPHVIZ_CONTAINER);
    
    containers.forEach(container => {
      // Check for light/dark variants inside
      const lightElements = container.querySelectorAll(CONSTANTS.SELECTORS.GRAPHVIZ_LIGHT);
      const darkElements = container.querySelectorAll(CONSTANTS.SELECTORS.GRAPHVIZ_DARK);
      
      if (lightElements.length > 0 && darkElements.length > 0) {
        lightElements.forEach(el => toggleThemeElements(el, null, theme));
        darkElements.forEach(el => toggleThemeElements(null, el, theme));
        log(`Graphviz: Showing ${theme} theme`);
      }
    });

    // Strategy 2: Direct siblings with graphviz-light/dark classes
    document.querySelectorAll('.graphviz-light').forEach(el => {
      el.style.display = theme === CONSTANTS.THEMES.LIGHT ? 'block' : 'none';
    });
    document.querySelectorAll('.graphviz-dark').forEach(el => {
      el.style.display = theme === CONSTANTS.THEMES.DARK ? 'block' : 'none';
    });
  }

  /**
   * Apply theme to all diagram types (except Mermaid - handled by seamaiden.js)
   */
  function applyDiagramThemes() {
    const theme = getCurrentTheme();
    log(`Applying theme: ${theme}`);
    
    applyPlantUMLTheme(theme);
    applyGraphvizTheme(theme);
    
    // Dispatch event for other scripts
    dispatchCustomEvent(CONSTANTS.EVENTS.DIAGRAM_THEME_APPLIED, { theme });
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize theme observer
   */
  function initializeThemeObserver() {
    log('Initializing diagram theme switcher...');
    
    // Apply theme immediately
    applyDiagramThemes();

    // Watch for theme changes
    createThemeObserver(() => {
      log('Theme changed, reapplying...');
      setTimeout(applyDiagramThemes, CONSTANTS.TIMING.QUICK_DELAY);
    });

    log('Theme switcher initialized');
  }

  /**
   * Main initialization
   */
  function initialize() {
    // Wait for body to have theme attribute
    if (document.body.getAttribute('data-md-color-scheme')) {
      initializeThemeObserver();
    } else {
      // Theme not set yet, wait and retry
      setTimeout(initialize, CONSTANTS.TIMING.SHORT_DELAY);
    }
  }

  // Initialize with Material navigation support
  initWithMaterialSupport(initialize, CONSTANTS.TIMING.SHORT_DELAY);

  // ============================================================================
  // DEBUG EXPORTS
  // ============================================================================

  // Expose for debugging
  if (CONFIG.debugMode) {
    window.diagramTheme = {
      applyDiagramThemes,
      applyPlantUMLTheme,
      applyGraphvizTheme,
      getCurrentTheme
    };
  }

})();
