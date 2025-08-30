// Wait for Mermaid to finish rendering
window.addEventListener('load', function() {
  setTimeout(function() {
    document.querySelectorAll('svg[role="graphics-document document"]').forEach(svg => {
      svg.setAttribute('role', 'img');
      svg.setAttribute('tabindex', '0');
      svg.removeAttribute('aria-roledescription');
    });
  }, 1000); // Adjust delay if needed
});
