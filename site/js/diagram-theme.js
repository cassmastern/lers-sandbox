/**
 * Unified Diagram Theme Switcher
 * Handles theme switching for Graphviz and PlantUML diagrams
 * (Mermaid handles its own theme switching via reinitialization)
 */
(function() {
  'use strict';

  function switchDiagramTheme(isDark) {
    // Switch Graphviz diagrams
    document.querySelectorAll('.graphviz-diagram').forEach(container => {
      const light = container.querySelector('.diagram-light');
      const dark = container.querySelector('.diagram-dark');

      if (light && dark) {
        if (isDark) {
          light.style.display = 'none';
          dark.style.display = 'block';
        } else {
          light.style.display = 'block';
          dark.style.display = 'none';
        }
      }
    });

    // Switch PlantUML diagrams (if theme variants are available)
    document.querySelectorAll('.plantuml-diagram').forEach(container => {
      const light = container.querySelector('.diagram-light');
      const dark = container.querySelector('.diagram-dark');

      if (light && dark) {
        if (isDark) {
          light.style.display = 'none';
          dark.style.display = 'block';
        } else {
          light.style.display = 'block';
          dark.style.display = 'none';
        }
      }
    });
  }

  function getCurrentTheme() {
    return document.body.getAttribute('data-md-color-scheme') === 'slate';
  }

  // Watch for theme changes
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-md-color-scheme') {
        const isDark = getCurrentTheme();
        switchDiagramTheme(isDark);
      }
    });
  });

  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme']
  });

  // Initialize on page load
  function initTheme() {
    const isDark = getCurrentTheme();
    switchDiagramTheme(isDark);
  }

  // Handle Material theme's instant navigation
  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(() => {
      setTimeout(initTheme, 100);
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTheme);
    } else {
      initTheme();
    }
  }
})();
