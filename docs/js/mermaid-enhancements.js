// Enhanced Mermaid accessibility and zoom for MkDocs Material
(function() {
  'use strict';
  
  console.log('🔍 AODA Mermaid Enhancement Script Loading...');
  
  let lightbox = null;
  const maxWaitTime = 10000; // 10 seconds max wait
  
  // Create lightbox once
  function createLightbox() {
    if (lightbox) return lightbox;
    
    lightbox = document.createElement('div');
    lightbox.className = 'mermaid-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Zoomed diagram view - Press Escape to close');
    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    // Close handlers
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
    
    // Style the clone for proper zoom display
    clone.style.cssText = `
      max-width: 95vw;
      max-height: 95vh;
      width: auto;
      height: auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      transform: scale(1.2);
      transform-origin: center;
    `;
    
    // Preserve accessibility
    const ariaLabel = svg.getAttribute('aria-label');
    if (ariaLabel) clone.setAttribute('aria-label', ariaLabel + ' - Zoomed view');
    
    lb.innerHTML = '';
    lb.appendChild(clone);
    lb.style.display = 'flex';
    clone.focus();
    
    console.log('✅ Diagram opened in lightbox');
  }
  
  function closeLightbox() {
    if (lightbox) {
      lightbox.style.display = 'none';
      console.log('✅ Lightbox closed');
    }
  }
  
  // Process ALT comments and add zoom functionality
  function enhanceDiagram(mermaidContainer) {
    const svg = mermaidContainer.querySelector('svg');
    if (!svg || svg.hasAttribute('data-enhanced')) return;
    
    // Mark as processed
    svg.setAttribute('data-enhanced', 'true');
    
    // Find ALT comment - look in previous siblings and parent content
    let altText = findAltText(mermaidContainer);
    
    // Add accessibility attributes
    if (altText) {
      const titleId = `svg-title-${Date.now()}${Math.random().toString(36).slice(2)}`;
      const descId = `svg-desc-${Date.now()}${Math.random().toString(36).slice(2)}`;
      
      // Remove existing title/desc
      const existingTitle = svg.querySelector('title');
      const existingDesc = svg.querySelector('desc');
      if (existingTitle) existingTitle.remove();
      if (existingDesc) existingDesc.remove();
      
      // Add new title and description
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.id = titleId;
      title.textContent = 'Diagram';
      
      const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
      desc.id = descId;
      desc.textContent = altText;
      
      svg.insertBefore(title, svg.firstChild);
      svg.insertBefore(desc, title.nextSibling);
      
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-labelledby', `${titleId} ${descId}`);
      svg.setAttribute('aria-label', `Diagram: ${altText} - Click to zoom`);
    } else {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'Diagram - Click to zoom');
    }
    
    // Add zoom functionality
    svg.setAttribute('tabindex', '0');
    svg.style.cursor = 'zoom-in';
    svg.style.transition = 'opacity 0.2s ease';
    
    // Hover effect
    svg.addEventListener('mouseenter', () => {
      svg.style.opacity = '0.8';
    });
    svg.addEventListener('mouseleave', () => {
      svg.style.opacity = '1';
    });
    
    // Click handler
    svg.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(svg);
    });
    
    // Keyboard handler
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(svg);
      }
    });
    
    console.log(`✅ Enhanced diagram with ALT: "${altText ? altText.substring(0, 50) + '...' : 'none'}"`);
  }
  
  function findAltText(container) {
    console.log('🔍 Looking for ALT comment for container:', container);
    
    // Strategy 1: Look in the actual page content for ALT comments
    const allNodes = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );
    
    const comments = [];
    let comment;
    while (comment = allNodes.nextNode()) {
      if (comment.textContent.trim().startsWith('ALT:')) {
        comments.push({
          node: comment,
          text: comment.textContent.substring(4).trim()
        });
      }
    }
    
    console.log(`Found ${comments.length} ALT comments total:`, comments.map(c => c.text.substring(0, 50)));
    
    // Strategy 2: Find closest ALT comment before this mermaid container
    let altText = null;
    let minDistance = Infinity;
    
    comments.forEach(commentObj => {
      const commentPos = commentObj.node.compareDocumentPosition(container);
      // If comment comes before container in document order
      if (commentPos & Node.DOCUMENT_POSITION_FOLLOWING) {
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(commentObj.node.cloneNode());
        tempDiv.appendChild(container.cloneNode());
        const distance = Array.from(document.body.querySelectorAll('*')).indexOf(container) - 
                        Array.from(document.body.querySelectorAll('*')).indexOf(commentObj.node);
        if (distance > 0 && distance < minDistance) {
          minDistance = distance;
          altText = commentObj.text;
        }
      }
    });
    
    console.log(`Selected ALT text: ${altText ? altText.substring(0, 50) + '...' : 'none'}`);
    return altText;
  }
  
  function processAllDiagrams() {
    const containers = document.querySelectorAll('.mermaid');
    let processed = 0;
    
    containers.forEach(container => {
      const svg = container.querySelector('svg');
      if (svg && !svg.hasAttribute('data-enhanced')) {
        enhanceDiagram(container);
        processed++;
      }
    });
    
    console.log(`✅ Processed ${processed} diagrams out of ${containers.length} containers`);
    return processed;
  }
  
  function waitForMermaidAndProcess() {
    const startTime = Date.now();
    let attempts = 0;
    
    function check() {
      attempts++;
      const elapsed = Date.now() - startTime;
      
      console.log(`🔍 Check attempt ${attempts} - looking for Mermaid diagrams...`);
      
      // Look for both rendered SVGs and unrendered containers
      const containers = document.querySelectorAll('.mermaid');
      const svgs = document.querySelectorAll('.mermaid svg');
      const canvases = document.querySelectorAll('.mermaid canvas');
      const renderedCount = svgs.length + canvases.length;
      
      console.log(`📊 Found: ${containers.length} containers, ${svgs.length} SVGs, ${canvases.length} canvases`);
      
      if (elapsed > maxWaitTime) {
        console.log('⏰ Timeout reached - processing whatever we have...');
        processAllDiagrams();
        return;
      }
      
      if (containers.length === 0) {
        console.log('ℹ️ No Mermaid containers found - maybe no diagrams on this page');
        return;
      }
      
      // Process if we have some rendered diagrams, or if we've waited long enough
      if (renderedCount > 0 && (renderedCount >= containers.length || attempts > 10)) {
        console.log('🎯 Processing diagrams now...');
        setTimeout(() => processAllDiagrams(), 100);
      } else {
        console.log(`⏳ Waiting... (${renderedCount}/${containers.length} rendered)`);
        setTimeout(check, 500);
      }
    }
    
    check();
  }
  
  function init() {
    console.log('🚀 Initializing AODA Mermaid enhancements...');
    
    // Debug: Log current page info
    console.log('Current page:', window.location.pathname);
    console.log('Document ready state:', document.readyState);
    
    // Wait for Material theme and Mermaid to load
    setTimeout(() => {
      console.log('🕐 Starting Mermaid detection...');
      waitForMermaidAndProcess();
    }, 1000);
    
    // Watch for navigation changes (Material theme uses instant loading)
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
              if (node.classList?.contains('mermaid') || 
                  node.querySelector?.('.mermaid') ||
                  node.classList?.contains('md-content')) {
                shouldReprocess = true;
              }
            }
          });
        }
      });
      
      if (shouldReprocess) {
        console.log('🔄 Page content changed - reprocessing Mermaid diagrams...');
        setTimeout(waitForMermaidAndProcess, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also listen for instant loading events from Material theme
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(waitForMermaidAndProcess, 500);
    });
    
    console.log('✅ AODA enhancement system initialized');
  }
  
  // Start when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();