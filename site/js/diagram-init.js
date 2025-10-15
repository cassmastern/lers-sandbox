/**
 * Mermaid Diagram Initialization
 * Handles client-side rendering of Mermaid diagrams with theme support
 */
(function() {
  'use strict';

  let mermaidInitialized = false;

  function getMermaidConfig(isDark) {
    const lightThemeVars = {
      primaryColor: '#ffffff',
      primaryTextColor: '#000000',
      primaryBorderColor: '#333333',
      lineColor: '#333333',
      background: '#ffffff',
      secondaryColor: '#f9f9f9',
      tertiaryColor: '#f0f0f0',
      textColor: '#000000',
      actorTextColor: '#000000',
      labelTextColor: '#000000',
      actorBkg: '#ffffff',
      actorBorder: '#333333',
      signalColor: '#333333',
      signalTextColor: '#000000',
      nodeBkg: '#ffffff',
      nodeBorder: '#333333',
      clusterBkg: '#f9f9f9',
      clusterBorder: '#333333',
      defaultLinkColor: '#333333',
      titleColor: '#000000',
      edgeLabelBackground: '#ffffff',
      fontFamily: 'sans-serif',
      fontSize: '14px'
    };

    const darkThemeVars = {
      primaryColor: '#2d2d2d',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#aaaaaa',
      lineColor: '#aaaaaa',
      background: '#1e1e1e',
      secondaryColor: '#2d2d2d',
      tertiaryColor: '#3d3d3d',
      textColor: '#ffffff',
      actorTextColor: '#ffffff',
      labelTextColor: '#ffffff',
      actorBkg: '#2d2d2d',
      actorBorder: '#aaaaaa',
      signalColor: '#aaaaaa',
      signalTextColor: '#ffffff',
      nodeBkg: '#2d2d2d',
      nodeBorder: '#aaaaaa',
      clusterBkg: '#1e1e1e',
      clusterBorder: '#666666',
      defaultLinkColor: '#aaaaaa',
      titleColor: '#ffffff',
      edgeLabelBackground: '#1e1e1e',
      fontFamily: 'sans-serif',
      fontSize: '14px'
    };

    return {
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      themeVariables: isDark ? darkThemeVars : lightThemeVars,
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'cardinal' },
      sequence: { useMaxWidth: true, mirrorActors: true },
      securityLevel: 'loose',
      fontFamily: 'sans-serif'
    };
  }

  function initializeMermaid() {
    const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate';
    mermaid.initialize(getMermaidConfig(isDark));
    mermaidInitialized = true;
  }

  function renderMermaidDiagrams() {
    // Store original content before processing
    document.querySelectorAll('.mermaid:not([data-processed])').forEach(element => {
      if (!element.getAttribute('data-original-content')) {
        element.setAttribute('data-original-content', element.textContent);
      }
    });

    mermaid.run().then(() => {
      document.dispatchEvent(new CustomEvent('diagramsRendered', {
        detail: { type: 'mermaid' }
      }));
    }).catch(err => {
      console.warn('Mermaid rendering error:', err);
    });
  }

  function reinitializeMermaid() {
    // Reset processed diagrams
    document.querySelectorAll('.mermaid[data-processed]').forEach(element => {
      const original = element.getAttribute('data-original-content');
      if (original) {
        element.removeAttribute('data-processed');
        element.textContent = original;
      }
    });

    mermaidInitialized = false;
    initializeMermaid();
    
    setTimeout(() => {
      renderMermaidDiagrams();
    }, 100);
  }

  // Watch for theme changes
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-md-color-scheme') {
        reinitializeMermaid();
      }
    });
  });

  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-md-color-scheme']
  });

  // Initialize on page load
  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(() => {
      if (!mermaidInitialized) {
        initializeMermaid();
      }
      setTimeout(renderMermaidDiagrams, 100);
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initializeMermaid();
        renderMermaidDiagrams();
      });
    } else {
      initializeMermaid();
      renderMermaidDiagrams();
    }
  }
})();
