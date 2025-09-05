// docs/js/seamaiden-theme-switchr.js
let mermaidInitialized = false;

function initializeMermaid() {
  const isDarkMode = document.body.getAttribute('data-md-color-scheme') === 'slate';
  
  // Enhanced theme variables for better visibility
  const lightThemeVars = {
    // Base colors
    'primaryColor': '#ffffff',
    'primaryTextColor': '#000000',
    'primaryBorderColor': '#333333',
    'lineColor': '#333333',
    
    // Background colors
    'background': '#ffffff',
    'secondaryColor': '#f9f9f9',
    'tertiaryColor': '#f0f0f0',
    
    // Text colors
    'textColor': '#000000',
    'actorTextColor': '#000000',
    'labelTextColor': '#000000',
    
    // Sequence diagram specific
    'actorBkg': '#ffffff',
    'actorBorder': '#333333',
    'actorLineColor': '#333333',
    'signalColor': '#333333',
    'signalTextColor': '#000000',
    'activationBorderColor': '#333333',
    'activationBkgColor': '#f4f4f4',
    'sequenceNumberColor': '#ffffff',
    
    // Flowchart specific
    'nodeBkg': '#ffffff',
    'nodeBorder': '#333333',
    'clusterBkg': '#f9f9f9',
    'clusterBorder': '#333333',
    'defaultLinkColor': '#333333',
    'titleColor': '#000000',
    'edgeLabelBackground': '#ffffff',
    
    // Git diagram
    'git0': '#ff6b6b',
    'git1': '#4ecdc4',
    'git2': '#45b7d1',
    'git3': '#96ceb4',
    'git4': '#feca57',
    'git5': '#ff9ff3',
    'git6': '#54a0ff',
    'git7': '#5f27cd',
    
    // Font settings
    'fontFamily': 'sans-serif',
    'fontSize': '14px'
  };

  const darkThemeVars = {
    // Base colors
    'primaryColor': '#2d2d2d',
    'primaryTextColor': '#ffffff',
    'primaryBorderColor': '#aaaaaa',
    'lineColor': '#aaaaaa',
    
    // Background colors
    'background': '#1e1e1e',
    'secondaryColor': '#2d2d2d',
    'tertiaryColor': '#3d3d3d',
    
    // Text colors
    'textColor': '#ffffff',
    'actorTextColor': '#ffffff',
    'labelTextColor': '#ffffff',
    
    // Sequence diagram specific
    'actorBkg': '#2d2d2d',
    'actorBorder': '#aaaaaa',
    'actorLineColor': '#aaaaaa',
    'signalColor': '#aaaaaa',
    'signalTextColor': '#ffffff',
    'activationBorderColor': '#aaaaaa',
    'activationBkgColor': '#3d3d3d',
    'sequenceNumberColor': '#1e1e1e',
    
    // Flowchart specific
    'nodeBkg': '#2d2d2d',
    'nodeBorder': '#aaaaaa',
    'clusterBkg': '#1e1e1e',
    'clusterBorder': '#666666',
    'defaultLinkColor': '#aaaaaa',
    'titleColor': '#ffffff',
    'edgeLabelBackground': '#1e1e1e',
    
    // Git diagram
    'git0': '#ff6b6b',
    'git1': '#4ecdc4',
    'git2': '#45b7d1',
    'git3': '#96ceb4',
    'git4': '#feca57',
    'git5': '#ff9ff3',
    'git6': '#54a0ff',
    'git7': '#5f27cd',
    
    // Font settings
    'fontFamily': 'sans-serif',
    'fontSize': '14px'
  };

  const config = {
    startOnLoad: true,
    theme: isDarkMode ? 'dark' : 'default',
    themeVariables: isDarkMode ? darkThemeVars : lightThemeVars,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'cardinal'
    },
    sequence: {
      useMaxWidth: true,
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      mirrorActors: true,
      bottomMarginAdj: 1,
      useMaxWidth: true,
      rightAngles: false,
      showSequenceNumbers: false
    },
    gantt: {
      useMaxWidth: true
    },
    journey: {
      useMaxWidth: true
    },
    timeline: {
      useMaxWidth: true
    },
    gitGraph: {
      useMaxWidth: true
    },
    c4: {
      useMaxWidth: true
    },
    securityLevel: 'loose',
    fontFamily: 'sans-serif'
  };

  mermaid.initialize(config);
  mermaidInitialized = true;
}

function reinitializeMermaid() {
  // Clear any existing mermaid content
  document.querySelectorAll('.mermaid').forEach(element => {
    if (element.getAttribute('data-processed')) {
      element.removeAttribute('data-processed');
      element.innerHTML = element.getAttribute('data-original-content') || element.innerHTML;
    }
  });
  
  mermaidInitialized = false;
  initializeMermaid();
  
  // Re-render all diagrams
  mermaid.run().then(() => {
    // Process SVGs in the correct sequence after re-rendering
    processNewSvgs();
  }).catch(() => {
    // Fallback if mermaid.run() doesn't return a promise
    setTimeout(() => {
      processNewSvgs();
    }, 300);
  });
}

function processNewSvgs() {
  // Wait for SVGs to be fully rendered
  setTimeout(() => {
    // 1. First, apply accessibility patches
    patchSvgAccessibility();
    
    // 2. Then notify zoom script to rebind
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('mermaidReinitialized', {
        detail: { reason: 'themeChange' }
      }));
    }, 50);
  }, 100);
}

function patchSvgAccessibility() {
  // Apply the same accessibility fixes as svg-patcher.js
  document.querySelectorAll('svg[role="graphics-document document"]').forEach(svg => {
    svg.setAttribute('role', 'img');
    svg.setAttribute('tabindex', '0');
    svg.removeAttribute('aria-roledescription');
  });
  
  // Dispatch event to notify that accessibility processing is complete
  document.dispatchEvent(new CustomEvent('diagramsAccessibilityProcessed', {
    detail: { count: document.querySelectorAll('.mermaid svg[role="img"]').length }
  }));
}

// Initialize when DOM is ready
document$.subscribe(() => {
  if (!mermaidInitialized) {
    // Store original content before processing
    document.querySelectorAll('.mermaid').forEach(element => {
      if (!element.getAttribute('data-original-content')) {
        element.setAttribute('data-original-content', element.innerHTML);
      }
    });
    
    initializeMermaid();
  }
});

// Watch for theme changes
const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-md-color-scheme') {
      setTimeout(() => {
        reinitializeMermaid();
      }, 100);
    }
  });
});

// Start observing theme changes
themeObserver.observe(document.body, { 
  attributes: true, 
  attributeFilter: ['data-md-color-scheme'] 
});

// Handle dynamic content loading (if needed)
if (typeof document$ !== 'undefined') {
  document$.subscribe(() => {
    setTimeout(() => {
      if (mermaidInitialized) {
        mermaid.run();
      }
    }, 100);
  });
}

