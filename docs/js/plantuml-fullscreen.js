// PlantUML Fullscreen Toggle
// Add this file to docs/javascripts/plantuml-fullscreen.js

// Run immediately, before DOMContentLoaded, to wrap SVGs early
(function() {
    function wrapGraphvizSVGs() {
        document.querySelectorAll('svg.graphviz').forEach(svg => {
            // Check if already wrapped
            if (!svg.parentElement.classList.contains('graphviz-container')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'graphviz-container';
                svg.parentNode.insertBefore(wrapper, svg);
                wrapper.appendChild(svg);
            }
        });
    }
    
    // Wrap immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapGraphvizSVGs);
    } else {
        wrapGraphvizSVGs();
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // Ensure Graphviz SVGs are wrapped (defensive)
    document.querySelectorAll('svg.graphviz').forEach(svg => {
        if (!svg.parentElement.classList.contains('graphviz-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'graphviz-container';
            svg.parentNode.insertBefore(wrapper, svg);
            wrapper.appendChild(svg);
        }
    });
    
    // Find all PlantUML and Graphviz diagram containers
    const diagrams = document.querySelectorAll('.puml-container, .graphviz-container');
    
    diagrams.forEach(diagram => {
        // Create fullscreen button
        const btn = document.createElement('button');
        btn.className = 'puml-fullscreen-btn';
        btn.innerHTML = '⛶';
        btn.title = 'Toggle Fullscreen (F11 or ESC to exit)';
        btn.setAttribute('aria-label', 'Toggle Fullscreen');
        
        // Make container relatively positioned for button placement
        diagram.style.position = 'relative';
        diagram.appendChild(btn);
        
        // Fullscreen toggle handler
        btn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                diagram.requestFullscreen().catch(err => {
                    console.error('Error attempting to enable fullscreen:', err);
                });
            } else {
                // Exit fullscreen
                document.exitFullscreen();
            }
        });
    });
    
    // Update button appearance when fullscreen state changes
    document.addEventListener('fullscreenchange', () => {
        const diagrams = document.querySelectorAll('.puml-container, .graphviz-container');
        diagrams.forEach(diagram => {
            const btn = diagram.querySelector('.puml-fullscreen-btn');
            if (btn) {
                if (document.fullscreenElement === diagram) {
                    btn.innerHTML = '✕';
                    btn.title = 'Exit Fullscreen (ESC)';
                } else {
                    btn.innerHTML = '⛶';
                    btn.title = 'Toggle Fullscreen (F11 or ESC to exit)';
                }
            }
        });
    });
    
    // Handle ESC key in fullscreen
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
    });
});
