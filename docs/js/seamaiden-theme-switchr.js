window.addEventListener('load', function() {
  setTimeout(function() {
    const isDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';

    // Function to apply styles based on theme
    function applyTheme(svg, isDark) {
      // Set background color
      svg.style.backgroundColor = isDark ? '#1e1e1e' : '#ffffff';

      // Style all lines, paths, and polygons (arrows, connectors)
      const linesAndArrows = svg.querySelectorAll('path, line, polyline, polygon');
      linesAndArrows.forEach(el => {
        el.style.stroke = isDark ? '#ffffff' : '#333333';
        el.style.fill = el.tagName === 'polygon' ? (isDark ? '#ffffff' : '#333333') : 'none';
      });

      // Style all text elements
      const texts = svg.querySelectorAll('text, tspan');
      texts.forEach(el => {
        el.style.fill = isDark ? '#ffffff' : '#000000';
        el.style.stroke = 'none';
      });

      // Style subgraph backgrounds (for flowcharts/graphs)
      const subgraphs = svg.querySelectorAll('rect.cluster');
      subgraphs.forEach(el => {
        el.style.fill = isDark ? '#2d2d2d' : '#f9f9f9';
        el.style.stroke = isDark ? '#aaaaaa' : '#333333';
      });

      // Style sequence diagram activation bars
      const activations = svg.querySelectorAll('rect.activation');
      activations.forEach(el => {
        el.style.fill = isDark ? '#3d3d3d' : '#f4f4f4';
        el.style.stroke = isDark ? '#aaaaaa' : '#333333';
      });

      // Style sequence diagram message lines (horizontal lines)
      const messageLines = svg.querySelectorAll('path.messageLine');
      messageLines.forEach(el => {
        el.style.stroke = isDark ? '#ffffff' : '#333333';
      });

      // Style sequence diagram message text (labels)
      const messageTexts = svg.querySelectorAll('text.messageText');
      messageTexts.forEach(el => {
        el.style.fill = isDark ? '#ffffff' : '#000000';
      });
    }

    // Apply theme to all Mermaid diagrams
    document.querySelectorAll('.mermaid svg').forEach(function(svg) {
      applyTheme(svg, isDarkMode);
    });

    // Watch for theme changes (if your site supports dynamic theme switching)
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'data-md-color-scheme') {
          const newIsDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';
          document.querySelectorAll('.mermaid svg').forEach(function(svg) {
            applyTheme(svg, newIsDarkMode);
          });
        }
      });
    });
    observer.observe(document.body, { attributes: true });
  }, 2000); // Wait for Mermaid to fully render
});

