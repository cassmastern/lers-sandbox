import subprocess
import hashlib
from pathlib import Path


def on_pre_build(config):
    cache_dir = Path(config['docs_dir']) / '.diagram_cache'
    cache_dir.mkdir(exist_ok=True)
    print(f"📁 Ensured .diagram_cache exists at: {cache_dir}")


def generate_graphviz_svg(code, output_path, theme='light'):
    print(f"🧪 generate_graphviz_svg() for: {output_path} (theme={theme})")

    colors = {
        'bgcolor': '#1e1e1e' if theme == 'dark' else '#ffffff',
        'fontcolor': '#ffffff' if theme == 'dark' else '#000000',
        'nodecolor': '#2d2d2d' if theme == 'dark' else '#ffffff',
        'edgecolor': '#aaaaaa' if theme == 'dark' else '#333333',
    }

    theme_attrs = (
        f'  graph [bgcolor="{colors["bgcolor"]}" fontcolor="{colors["fontcolor"]}"];\n'
        f'  node [style=filled fillcolor="{colors["nodecolor"]}" fontcolor="{colors["fontcolor"]}" color="{colors["edgecolor"]}"];\n'
        f'  edge [color="{colors["edgecolor"]}" fontcolor="{colors["fontcolor"]}"];\n'
    )

    if code.strip().startswith('digraph') or code.strip().startswith('graph'):
        brace_index = code.find('{')
        if brace_index != -1:
            brace_open = brace_index + 1
            code = code[:brace_open] + '\n' + theme_attrs + code[brace_open:]

    print(f"📜 DOT source:\n{code[:300]}...")

    try:
        result = subprocess.run(
            ['dot', '-Tsvg'],
            input=code.encode('utf-8'),
            capture_output=True,
            check=True
        )
        svg_content = result.stdout.decode('utf-8')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"✅ Wrote SVG to {output_path}")
    except Exception as e:
        print(f"❌ Graphviz generation failed: {e}")


def extract_accessibility_metadata(code):
    metadata = {'title': '', 'description': ''}
    for line in code.split('\n'):
        line = line.strip()
        if 'accTitle:' in line:
            metadata['title'] = line.split('accTitle:', 1)[1].strip().strip('"\'')
        elif 'accDescr:' in line:
            metadata['description'] = line.split('accDescr:', 1)[1].strip().strip('"\'')
    print(f"🧠 Extracted accessibility metadata: {metadata}")
    return metadata


def graphviz_formatter(source, language, css_class, options, md, **kwargs):
    print("✅ graphviz_formatter invoked")
    print(f"📜 Real diagram source:\n{source[:300]}...")

    cache_key = hashlib.md5(source.encode('utf-8')).hexdigest()
    cache_dir = Path(md.Meta.get('docs_dir', 'docs')) / '.diagram_cache'
    cache_dir.mkdir(exist_ok=True)

    svg_light = cache_dir / f"{cache_key}_light.svg"
    svg_dark = cache_dir / f"{cache_key}_dark.svg"
    print(f"📄 Target paths:\n  {svg_light}\n  {svg_dark}")

    metadata = extract_accessibility_metadata(source)

    generate_graphviz_svg(source, svg_light, theme='light')
    generate_graphviz_svg(source, svg_dark, theme='dark')

    acc_attrs = ''
    if metadata['title']:
        acc_attrs += f' data-acc-title="{metadata["title"]}"'
    if metadata['description']:
        acc_attrs += f' data-acc-descr="{metadata["description"]}"'

    rel_light = svg_light.relative_to(Path(md.Meta.get('docs_dir', 'docs')))
    rel_dark = svg_dark.relative_to(Path(md.Meta.get('docs_dir', 'docs')))

    html = f'''<div class="diagram-container graphviz-diagram" data-diagram-type="graphviz"{acc_attrs}>
    <object class="diagram-light" data="/{rel_light}" type="image/svg+xml">
        <img src="/{rel_light}" alt="{metadata.get('title', 'Graphviz diagram')}" />
    </object>
    <object class="diagram-dark" data="/{rel_dark}" type="image/svg+xml" style="display:none;">
        <img src="/{rel_dark}" alt="{metadata.get('title', 'Graphviz diagram')}" />
    </object>
</div>'''

    return html
