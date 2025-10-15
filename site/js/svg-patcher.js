// svg-patcher.js - Updated to work with theme switching
function patchSvgAccessibility() {
  document.querySelectorAll('svg[role="graphics-document document"]').forEach(svg => {
    svg.setAttribute('role', 'img');
    svg.setAttribute('tabindex', '0');
    svg.removeAttribute('aria-roledescription');
  });
}

// Initial patching on page load
window.addEventListener('load', function() {
  setTimeout(function() {
    patchSvgAccessibility();
    
    // Dispatch event to notify other scripts
    document.dispatchEvent(new CustomEvent('diagramsAccessibilityProcessed', {
      detail: { count: document.querySelectorAll('.mermaid svg[role="img"]').length }
    }));
  }, 1000); // Keep original delay for initial load
});

// Handle Material theme's instant navigation
if (typeof document$ !== 'undefined' && document$.subscribe) {
  document$.subscribe(() => {
    setTimeout(() => {
      patchSvgAccessibility();
      document.dispatchEvent(new CustomEvent('diagramsAccessibilityProcessed', {
        detail: { count: document.querySelectorAll('.mermaid svg[role="img"]').length }
      }));
    }, 1200); // Slightly longer delay for navigation
  });
}

