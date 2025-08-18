import os
import datetime
import re

def update_timestamp(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---'):
        return  # No front matter

    parts = content.split('---', 2)
    if len(parts) < 3:
        return  # Malformed front matter

    front_matter = parts[1]
    body = parts[2]

    if 'timestamp: true' not in front_matter:
        return  # Opt-out

    # Get file mod time
    mod_time = datetime.datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d')

    # Inject or update last_updated
    if 'last_updated:' in front_matter:
        front_matter = re.sub(r'last_updated:\s*".*?"', f'last_updated: "{mod_time}"', front_matter)
    else:
        front_matter += f'\nlast_updated: "{mod_time}"'

    new_content = f'---{front_matter}---{body}'
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def scan_docs():
    for root, _, files in os.walk('docs'):
        for file in files:
            if file.endswith('.md'):
                update_timestamp(os.path.join(root, file))

if __name__ == "__main__":
    scan_docs()
