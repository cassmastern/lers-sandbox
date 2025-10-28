/**
 * Unified Diagram Theme Switcher
 * Handles theme switching for PlantUML and Graphviz diagrams
 * Works alongside seamaiden.js (which handles Mermaid)
 */
(function() {
  'use strict';

  const CONFIG = {
    debugMode: true  // Enable debug logging
  };

  const log = CONFIG.debugMode ? console.log.bind(console, '[diagram-theme]') : () => {};

  /**
   * Get current Material theme
   */
  function getCurrentTheme() {
    const scheme = document.body.getAttribute('data-md-color-scheme');
    return scheme === 'slate' ? 'dark' : 'light';
  }

  /**
   * Apply theme to PlantUML diagrams
   * Structure: <div class="puml-container"><div class="puml_light">...<div class="puml_dark">...
   */
  function applyPlantUMLTheme(theme) {
    const containers = document.querySelectorAll('.puml-container');
    
    containers.forEach(container => {
      const lightDiv = container.querySelector('.puml_light');
      const darkDiv = container.querySelector('.puml_dark');
      
      if (lightDiv && darkDiv) {
        if (theme === 'light') {
          lightDiv.style.display = 'block';
          darkDiv.style.display = 'none';
          log('PlantUML: Showing light theme');
        } else {
          lightDiv.style.display = 'none';
          darkDiv.style.display = 'block';
          log('PlantUML: Showing dark theme');
        }
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
    const containers = document.querySelectorAll('[class*="graphviz"]');
    
    containers.forEach(container => {
      // Check for light/dark variants inside
      const lightElements = container.querySelectorAll('.graphviz-light, [class*="graphviz-light"]');
      const darkElements = container.querySelectorAll('.graphviz-dark, [class*="graphviz-dark"]');
      
      if (lightElements.length > 0 && darkElements.length > 0) {
        if (theme === 'light') {
          lightElements.forEach(el => el.style.display = 'block');
          darkElements.forEach(el => el.style.display = 'none');
          log('Graphviz: Showing light theme');
        } else {
          lightElements.forEach(el => el.style.display = 'none');
          darkElements.forEach(el => el.style.display = 'block');
          log('Graphviz: Showing dark theme');
        }
      }
    });

    // Strategy 2: Direct siblings with graphviz-light/dark classes
    document.querySelectorAll('.graphviz-light').forEach(el => {
      el.style.display = theme === 'light' ? 'block' : 'none';
    });
    document.querySelectorAll('.graphviz-dark').forEach(el => {
      el.style.display = theme === 'dark' ? 'block' : 'none';
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
    
    // Dispatch event for other scripts to know theme changed
    document.dispatchEvent(new CustomEvent('diagramThemeApplied', {
      detail: { theme }
    }));
  }

  /**
   * Initialize theme observer
   */
  function initializeThemeObserver() {
    log('Initializing diagram theme switcher...');
    
    // Apply theme immediately
    applyDiagramThemes();

    // Watch for theme changes on body[data-md-color-scheme]
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-md-color-scheme') {
          log('Theme changed, reapplying...');
          setTimeout(applyDiagramThemes, 50);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
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
      setTimeout(initialize, 100);
    }
  }

  // Handle Material's instant navigation (document$ observable)
  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(() => {
      setTimeout(initialize, 100);
    });
  } else {
    // Standard initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      initialize();
    }
  }

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
