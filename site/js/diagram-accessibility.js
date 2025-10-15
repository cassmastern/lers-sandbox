/**
 * Unified Diagram Accessibility Enhancement
 * Adds ARIA attributes and alt text to all diagram types
 */
(function() {
  'use strict';

  function enhanceMermaidAccessibility() {
    document.querySelectorAll('.mermaid svg').forEach(svg => {
      if (svg.hasAttribute('data-accessibility-enhanced')) return;

      // Fix Mermaid's default role
      if (svg.getAttribute('role') === 'graphics-document document') {
        svg.setAttribute('role', 'img');
        svg.removeAttribute('aria-roledescription');
      }

      svg.setAttribute('tabindex', '0');

      // Extract accessibility metadata from Mermaid's built-in accTitle/accDescr
      const title = svg.querySelector('title')?.textContent;
      const desc = svg.querySelector('desc')?.textContent;

      if (title) {
        svg.setAttribute('aria-label', title);
      }
      if (desc) {
        svg.setAttribute('aria-describedby', desc);
      }

      svg.setAttribute('data-accessibility-enhanced', 'true');
    });
  }

  function enhanceGraphvizAccessibility() {
    document.querySelectorAll('.graphviz-diagram').forEach(container => {
      if (container.hasAttribute('data-accessibility-enhanced')) return;

      const title = container.getAttribute('data-acc-title');
      const desc = container.getAttribute('data-acc-descr');

      // Find SVG in both light and dark variants
      container.querySelectorAll('object').forEach(obj => {
        obj.addEventListener('load', () => {
          try {
            const svgDoc = obj.contentDocument;
            if (!svgDoc) return;

            const svg = svgDoc.querySelector('svg');
            if (!svg) return;

            svg.setAttribute('role', 'img');
            svg.setAttribute('tabindex', '0');

            if (title) {
              svg.setAttribute('aria-label', title);
              // Also add title element
              let titleEl = svgDoc.querySelector('title');
              if (!titleEl) {
                titleEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'title');
                svg.insertBefore(titleEl, svg.firstChild);
              }
              titleEl.textContent = title;
            }

            if (desc) {
              let descEl = svgDoc.querySelector('desc');
              if (!descEl) {
                descEl = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'desc');
                svg.insertBefore(descEl, svg.firstChild);
              }
              descEl.textContent = desc;
              svg.setAttribute('aria-describedby', 'diagram-desc');
              descEl.id = 'diagram-desc';
            }
          } catch (e) {
            console.warn('Cannot access SVG content (CORS):', e);
          }
        });
      });

      container.setAttribute('data-accessibility-enhanced', 'true');
    });
  }

  function enhancePlantUMLAccessibility() {
    document.querySelectorAll('.plantuml-diagram').forEach(container => {
      if (container.hasAttribute('data-accessibility-enhanced')) return;

      const svg = container.querySelector('svg');
      if (!svg) return;

      svg.setAttribute('role', 'img');
      svg.setAttribute('tabindex', '0');

      // Look for accessibility metadata in data attributes
      const title = container.getAttribute('data-acc-title');
      const desc = container.getAttribute('data-acc-descr');

      if (title) {
        svg.setAttribute('aria-label', title);
      }
      if (desc) {
        let descEl = svg.querySelector('desc');
        if (!descEl) {
          descEl = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
          svg.insertBefore(descEl, svg.firstChild);
        }
        descEl.textContent = desc;
        svg.setAttribute('aria-describedby', 'diagram-desc');
        descEl.id = 'diagram-desc';
      }

      container.setAttribute('data-accessibility-enhanced', 'true');
    });
  }

  function processAllDiagrams() {
    enhanceMermaidAccessibility();
    enhanceGraphvizAccessibility();
    enhancePlantUMLAccessibility();

    // Notify other scripts that accessibility processing is complete
    document.dispatchEvent(new CustomEvent('diagramsAccessibilityProcessed', {
      detail: {
        mermaid: document.querySelectorAll('.mermaid svg[data-accessibility-enhanced]').length,
        graphviz: document.querySelectorAll('.graphviz-diagram[data-accessibility-enhanced]').length,
        plantuml: document.querySelectorAll('.plantuml-diagram[data-accessibility-enhanced]').length
      }
    }));
  }

  // Listen for diagram rendering events
  document.addEventListener('diagramsRendered', () => {
    setTimeout(processAllDiagrams, 100);
  });

  // Initial processing after page load
  function initAccessibility() {
    setTimeout(processAllDiagrams, 500);
  }

  // Handle Material theme's instant navigation
  if (typeof document$ !== 'undefined' && document$.subscribe) {
    document$.subscribe(() => {
      setTimeout(initAccessibility, 300);
    });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAccessibility);
    } else {
      initAccessibility();
    }
  }

  // Observe for dynamically added diagrams
  const observer = new MutationObserver(() => {
    processAllDiagrams();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
