// Simple diagram zoom functionality
// scripts/js/diagram-zoom.js

(function() {
  'use strict';
  
  let lightbox = null;
  
  function createLightbox() {
    if (lightbox) return lightbox;
    
    lightbox = document.createElement('div');
    lightbox.className = 'diagram-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Zoomed diagram view');
    lightbox.style.display = 'none';
    
    // Close on click outside or escape key
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.style.display !== 'none') {
        closeLightbox();
      }
    });
    
    document.body.appendChild(lightbox);
    return lightbox;
  }
  
  function openLightbox(svg) {
    const lb = createLightbox();
    const clone = svg.cloneNode(true);
    
    // Preserve accessibility attributes
    clone.setAttribute('role', 'img');
    clone.setAttribute('tabindex', '0');
    
    // Style the cloned SVG
    clone.style.maxWidth = '95vw';
    clone.style.maxHeight = '95vh';
    clone.style.width = 'auto';
    clone.style.height = 'auto';
    clone.style.background = 'white';
    clone.style.borderRadius = '8px';
    clone.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    
    lb.innerHTML = '';
    lb.appendChild(clone);
    lb.style.display = 'flex';
    
    // Focus management
    clone.focus();
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = 'Diagram opened in zoom view. Press Escape to close.';
    lb.appendChild(announcement);
  }
  
  function closeLightbox() {
    if (lightbox) {
      lightbox.style.display = 'none';
      // Return focus to the original diagram
      const originalSvg = document.querySelector('.mermaid svg[data-zoomable="true"]:focus');
      if (originalSvg) originalSvg.focus();
    }
  }
  
  function makeZoomable(svg) {
    if (svg.hasAttribute('data-zoomable')) return;
    
    svg.setAttribute('data-zoomable', 'true');
    svg.style.cursor = 'zoom-in';
    
    // Add click handler
    svg.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(svg);
    });
    
    // Add keyboard handler
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(svg);
      }
    });
    
    // Update aria-label to mention zoom capability
    const currentLabel = svg.getAttribute('aria-label') || 'Diagram';
    svg.setAttribute('aria-label', currentLabel + ' - Click or press Enter to zoom');
  }
  
  function findAndProcessDiagrams() {
    const svgs = document.querySelectorAll('.mermaid svg:not([data-zoomable])');
    svgs.forEach(makeZoomable);
  }
  
  // Initialize
  function init() {
    findAndProcessDiagrams();
    
    // Watch for new diagrams (for dynamic content)
    const observer = new MutationObserver((mutations) => {
      let hasNewDiagrams = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.classList?.contains('mermaid') || 
                  node.querySelector?.('.mermaid')) {
                hasNewDiagrams = true;
              }
            }
          });
        }
      });
      
      if (hasNewDiagrams) {
        setTimeout(findAndProcessDiagrams, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();