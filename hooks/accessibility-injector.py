"""
MkDocs hook to inject accessibility metadata into diagram SVGs
Processes HTML comments and injects title, desc, role, and tabindex
Works with PlantUML, Graphviz, and any other SVG-based diagrams
"""

import re
import logging
from bs4 import BeautifulSoup, Comment

log = logging.getLogger('mkdocs.hooks.accessibility_injector')


def on_post_page(output, page, config):
    """
    Process rendered HTML to inject accessibility metadata into SVGs
    Runs after page is rendered but before it's written to disk
    """
    
    soup = BeautifulSoup(output, 'html.parser')
    
    comment_pattern = re.compile(
        r'diagram-a11y:\s*title="([^"]*)"\s+desc="([^"]*)"',
        re.IGNORECASE
    )
    
    processed_count = 0
    comments = soup.find_all(string=lambda text: isinstance(text, Comment))
    
    for comment in comments:
        comment_text = str(comment).strip()
        
        if 'diagram-a11y:' not in comment_text:
            continue
            
        match = comment_pattern.search(comment_text)
        if not match:
            continue
            
        title = match.group(1).strip()
        desc = match.group(2).strip()
        
        # Find all SVGs after this comment
        svgs = find_next_svgs(comment)
        
        if svgs:
            for svg in svgs:
                # Skip Mermaid SVGs (use native accTitle/accDescr)
                if is_mermaid_svg(svg):
                    log.warning(f"Skipping Mermaid SVG in {page.file.src_path} - use accTitle/accDescr instead")
                    continue
                
                inject_accessibility_metadata(svg, title, desc)
                processed_count += 1
        else:
            log.warning(f"No SVG found for accessibility comment in {page.file.src_path}: '{title[:50]}...'")
    
    if processed_count > 0:
        log.info(f"Injected accessibility metadata into {processed_count} diagram(s) in {page.file.src_path}")
    
    return str(soup)


def find_next_svgs(comment):
    """
    Find ALL SVG elements after a comment node
    Returns a list of SVGs (handles PlantUML's dual light/dark SVGs)
    """
    
    parent = comment.parent
    if not parent:
        return []
    
    found_svgs = []
    
    # Walk forward through document tree from comment's position
    next_elements = []
    current = comment
    for _ in range(10):  # Look at next 10 elements
        current = current.find_next()
        if current is None:
            break
        if hasattr(current, 'name'):
            next_elements.append(current)
    
    # Search through these elements for SVGs or SVG containers
    for elem in next_elements:
        # Check if element itself is SVG
        if elem.name == 'svg' and not is_mermaid_svg(elem):
            found_svgs.append(elem)
        
        # Check if element contains SVGs
        if elem.name in ['div', 'p', 'section', 'article']:
            nested_svgs = elem.find_all('svg', recursive=True)
            for svg in nested_svgs:
                if not is_mermaid_svg(svg):
                    found_svgs.append(svg)
            
            # Stop conditions for different diagram types
            elem_classes = elem.get('class', [])
            
            # PlantUML: Stop after finding puml-container
            if 'puml-container' in elem_classes:
                break
            
            # Graphviz (dual): Stop after finding dual light/dark structure
            if any('graphviz' in str(c) for c in elem_classes):
                has_light = elem.find(class_=lambda c: c and 'graphviz-light' in str(c))
                has_dark = elem.find(class_=lambda c: c and 'graphviz-dark' in str(c))
                if has_light or has_dark:
                    break
            
            # Graphviz (single): Stop after finding <p> with SVG
            if elem.name == 'p' and found_svgs:
                break
    
    return found_svgs


def is_mermaid_svg(svg):
    """
    Check if an SVG is a Mermaid diagram
    Mermaid SVGs are inside elements with class 'mermaid'
    """
    parent = svg.parent
    while parent:
        if parent.name and parent.get('class'):
            classes = parent.get('class', [])
            if 'mermaid' in classes:
                return True
        parent = parent.parent
    return False


def inject_accessibility_metadata(svg, title, desc):
    """
    Inject accessibility metadata into an SVG element
    Adds: role="img", tabindex="0", <title>, <desc>, aria-labelledby
    """
    
    # Get the soup instance for creating new tags
    soup = svg.find_parent('html') or svg
    while hasattr(soup, 'parent') and soup.parent:
        if hasattr(soup.parent, 'new_tag'):
            soup = soup.parent
            break
        soup = soup.parent
    
    if not hasattr(soup, 'new_tag'):
        from bs4 import BeautifulSoup
        soup = BeautifulSoup('', 'html.parser')
    
    # Remove existing title and desc elements to avoid duplicates
    for existing in svg.find_all(['title', 'desc']):
        existing.decompose()
    
    # Create new title element
    title_id = None
    if title:
        title_elem = soup.new_tag('title')
        title_elem.string = title
        title_id = generate_unique_id(svg, 'title')
        title_elem['id'] = title_id
        
        # Insert as first child
        if svg.contents:
            svg.contents[0].insert_before(title_elem)
        else:
            svg.append(title_elem)
    
    # Create new desc element
    desc_id = None
    if desc:
        desc_elem = soup.new_tag('desc')
        desc_elem.string = desc
        desc_id = generate_unique_id(svg, 'desc')
        desc_elem['id'] = desc_id
        
        # Insert after title if it exists, otherwise as first child
        if title and svg.find('title'):
            svg.find('title').insert_after(desc_elem)
        elif svg.contents:
            svg.contents[0].insert_before(desc_elem)
        else:
            svg.append(desc_elem)
    
    # Set aria-labelledby to reference BOTH title and desc (space-separated)
    if title_id and desc_id:
        svg['aria-labelledby'] = f"{title_id} {desc_id}"
    elif title_id:
        svg['aria-labelledby'] = title_id
    elif desc_id:
        svg['aria-labelledby'] = desc_id
    
    # Set ARIA role and tabindex for keyboard navigation
    svg['role'] = 'img'
    svg['tabindex'] = '0'


def generate_unique_id(svg, prefix):
    """
    Generate a unique ID for title/desc elements
    Uses SVG's existing ID or generates from content hash
    """
    import hashlib
    
    svg_id = svg.get('id', '')
    if not svg_id:
        # Generate hash from SVG content
        content = str(svg)[:200]
        svg_id = hashlib.md5(content.encode()).hexdigest()[:8]
    
    return f"svg-{prefix}-{svg_id}"


def on_page_markdown(markdown, page, config, files):
    """
    Validate accessibility comments in markdown source
    Warn if diagram blocks (PlantUML/Graphviz) lack accessibility metadata
    """
    lines = markdown.splitlines()
    with_a11y = 0
    without_a11y = 0
    prev_line = ""
    
    for line in lines:
        # Check PlantUML and Graphviz (NOT Mermaid - uses native directives)
        if line.strip().startswith("```") and any(diag in line for diag in ("plantuml", "graphviz", "puml", "dot")):
            if "diagram-a11y:" in prev_line:
                with_a11y += 1
            else:
                without_a11y += 1
        prev_line = line
    
    if without_a11y > 0:
        log.warning(
            f"Page {page.file.src_path} has {without_a11y} PlantUML/Graphviz diagram(s) "
            f"without accessibility metadata (found {with_a11y} with metadata)"
        )
    
    return markdown
    